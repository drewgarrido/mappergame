import os
from subprocess import call

try:
    os.remove("minmap.js")
except:
    pass

file_list = []
for a in os.listdir("."):
    if a[-2:] == "js":
        file_list.append(a)

print("Found: ")
print(file_list)

call(["uglifyjs"] + file_list + ["-c","-m","-o","minmap.js"], shell=True)
