import json
import subprocess
from pathlib import Path

questions = []
for raw_question in Path("questions").iterdir():
    if not raw_question.is_file():
        continue
    question = json.loads(raw_question.read_text())

    if question.get("question"):
        questions.append(question)
        continue

    print(f"Process: {raw_question}")
    # https://github.com/tesseract-ocr/tesseract
    # sudo dnf install tesseract tesseract-langpack-deu
    subprocess.run(
        f"tesseract images/{raw_question.stem}.png out -l deu",
        shell=True,
        check=True,
    )
    question["question"] = Path("out.txt").read_text()
    questions.append(question)

questions.sort(key=lambda x: int(x["seq"]))
with open("questions.json", mode="w") as fp:
    json.dump(questions, fp=fp, indent=2)
