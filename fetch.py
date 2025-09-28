import json
import os
import random
import time

import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.select import Select


def get_driver():
    options = webdriver.FirefoxOptions()
    # options.add_argument("--headless")
    driver = webdriver.Firefox(options=options)
    driver.maximize_window()
    return driver


QUESTIONS_PATH = "questions"
IMAGE_PATH = "images"
os.makedirs(QUESTIONS_PATH, exist_ok=True)
os.makedirs(IMAGE_PATH, exist_ok=True)

driver = get_driver()
driver.get("https://oet.bamf.de/ords/oetut/f?p=514:1")
for node in driver.find_elements(by=By.TAG_NAME, value="input"):
    if node.get_attribute("value") == "Zum Fragenkatalog":
        node.click()
        break

question_seq = "252"
while True:
    to_question_node = Select(driver.find_element(by=By.TAG_NAME, value="select"))
    to_question_node.select_by_visible_text(question_seq)

    time.sleep(random.randint(3, 6))
    node = driver.find_element(by=By.CLASS_NAME, value="RegionHeader")
    _, question_seq, _, end_seq = node.text.split(" ")
    print(f"{question_seq}/{end_seq}")
    image_src = None
    local_image = None
    question = None
    if image_node := next(
        iter(driver.find_elements(by=By.ID, value="P30_AUFGABENSTELLUNG_BILD")), None
    ):
        image_src = image_node.find_element(by=By.TAG_NAME, value="img").get_attribute(
            "src"
        )
        resp = requests.get(image_src)
        if resp.ok:
            local_image = f"{IMAGE_PATH}/{question_seq}.png"
            with open(local_image, mode="wb") as fp:
                fp.write(resp.content)
    elif question_node := next(
        iter(driver.find_elements(by=By.ID, value="P30_AUFGABENSTELLUNG")), None
    ):
        question = question_node.get_attribute("innerHTML")
    else:
        raise ValueError("Unable to find question details")

    question = {
        "seq": question_seq,
        "image_src": image_src,
        "local_image": local_image,
        "question": question,
        "possible_answers": [],
    }
    possible_answers = question["possible_answers"]
    node = driver.find_element(by=By.CLASS_NAME, value="t3borderless")
    for tr_node in node.find_elements(by=By.TAG_NAME, value="tr"):
        is_correct_answer = ""
        answer = ""
        for td_node in tr_node.find_elements(by=By.TAG_NAME, value="td"):
            if td_node.get_attribute("headers") == "RICHTIGE_ANTWORT":
                is_correct_answer = (
                    td_node.find_element(by=By.TAG_NAME, value="span")
                    .get_attribute("innerHTML")
                    .startswith("richtige")
                )
            elif td_node.get_attribute("headers") == "ANTWORT":
                answer = td_node.text
            if is_correct_answer and answer:
                break
        possible_answers.append([answer, is_correct_answer])
    with open(f"{QUESTIONS_PATH}/{question_seq}.json", mode="w") as fp:
        json.dump(question, fp=fp, indent=2)

    if question_seq == end_seq:
        break
    else:
        question_seq = str(int(question_seq) + 1)


driver.quit()
