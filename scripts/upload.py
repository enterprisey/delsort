"""
upload.py: upload delsort to a wiki

Run from the project root directory.

Usage: python scripts/upload.py SITE TARGET USERNAME [PASSWORD]

Uploads the file named "delsort.js" to the page TARGET on SITE, using the acccount for USERNAME. If PASSWORD isn't specified, it will be prompted for.
"""
import datetime
import getpass
import os.path
import re
import sys

from clint.textui import colored
from clint.textui import prompt
import git
from wikitools import page
from wikitools import wiki

USAGE = "Usage: python scripts/upload.py SITE ROOT USERNAME [PASSWORD]"
API_PAGES = {"enwiki": "https://en.wikipedia.org/w/api.php",
             "testwiki": "https://test.wikipedia.org/w/api.php"}
HEADER = "/* Uploaded from the Git repo @ {} (branch {}) */\n"
SUMMARY = "Updating delsort: {} @ {}"

if len(sys.argv) < 4:
    print(colored.yellow("Incorrect number of arguments supplied."))
    print(USAGE)
    sys.exit(1)

if "--help" in sys.argv:
    print(USAGE)
    sys.exit(0)

site_name = sys.argv[1]
if not site_name in API_PAGES:
    print(colored.yellow("Unrecognized wiki '%s'. Must be 'enwiki' or" +
                  " 'testwiki'" % site_name))
    sys.exit(1)
site = wiki.Wiki(API_PAGES[site_name])

root = sys.argv[2]
username = sys.argv[3]

if len(sys.argv) > 4:
    password = sys.argv[4]
else:
    password = getpass.getpass("Password for {} on {}: "
                               .format(username, site_name))

login_result = site.login(username, password)
if not login_result:
    print(colored.yellow("Error logging in."))
    sys.exit(1)
else:
    print("Successfully logged in.")
target = page.Page(site, title=root)

if not os.path.isfile("delsort.js"):
    print(colored.yellow("Couldn't find a file called 'delsort.js' in the project home."))
    sys.exit(1)

repo = git.Repo(os.getcwd())
branch = repo.active_branch
sha1 = branch.commit.hexsha
header = HEADER.format(sha1, branch)
print("Made a header.")

if site_name == "enwiki" and root == "User:APerson/delsort.js" and str(branch) == "master":
    print("Updating script documentation page.")
    docs = page.Page(site, title="User:APerson/delsort")
    docs_wikitext = docs.getWikiText()
    date = re.search("start date and age\|\d+\|\d+\|\d+", docs_wikitext).group(0)
    now = datetime.datetime.now()
    revised_date = "start date and age|%d|%d|%d" % (now.year, now.month, now.day)
    new_wikitext = docs_wikitext.replace(date, revised_date)
    result = docs.edit(text=new_wikitext, summary="Updating delsort \"updated\" time")
    if result["edit"]["result"] == "Success":
        print(colored.green("Success!") + " Updated the \"updated\" time on the documentation.")
    else:
        print(colored.red("Error updating the \"updated\" time: ") + result)

with open("delsort.js", "r") as delsort:
    new_text = header + delsort.read()
    edit_summary = SUMMARY.format(branch, sha1[:7])
    print("Uploading delsort...")
    result = target.edit(text=new_text, summary=edit_summary)
    if result["edit"]["result"] == "Success":
        print(colored.green("Done!") + " Uploaded delsort to " + root)
    else:
        print(colored.red("Error uploading delsort: ") + result)
