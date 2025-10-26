import json
import argostranslate.package
import argostranslate.translate

from_code = "de"
to_code = "en"

# Download and install Argos Translate package
argostranslate.package.update_package_index()
available_packages = argostranslate.package.get_available_packages()
package_to_install = next(
    filter(
        lambda x: x.from_code == from_code and x.to_code == to_code, available_packages
    )
)
argostranslate.package.install_from_path(package_to_install.download())


with open("questions.json") as fp:
    questions = json.loads(fp.read())

for q in questions:
    print(f"Process: {q['seq']}")
    q["translated_question"] = argostranslate.translate.translate(q["question"], from_code, to_code)
    for pa in q["possible_answers"]:
        text = argostranslate.translate.translate(pa[0], from_code, to_code)
        # [de_text, is_correct, en_text?]
        if len(pa) == 3:
            pa[2] = text
        elif len(pa) == 2:
            pa.append(text)
        else:
            raise ValueError(f'Invalid count? {pa}')


with open("questions_new.json", mode="w") as fp:
    json.dump(questions, fp=fp, indent=2)
