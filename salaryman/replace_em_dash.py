import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    # General Em Dash replacements
    (' — ', ', '), # default replacement for loose clauses, we will override specific ones below
    ('—', '-'), # default for tight dashes

    # Title
    ('30 Days, Even If', '30 Days, Even If'),
    ('30 Days-Even If', '30 Days, Even If'), # if caught by tight
    ('30 Days, Even If', '30 Days, Even If'), # safe

    # Specific phrases from analysis
    ('friend a man named <strong>Chief Amu</strong>, was', 'friend, a man named <strong>Chief Amu</strong>, was'),
    ('answer, the one I had', 'answer, the one I had'),
    ('structuring, paying yourself', 'structuring: paying yourself'),
    ('app, the way I did every morning, braced for the number, and', 'app, the way I did every morning, braced for the number, and'),

    # Image alts
    ('Salary-To-Zero Man, PDF Guide', 'Salary-To-Zero Man PDF Guide'),
    ('Bonus 1, Salary Expense Calculator', 'Bonus 1: Salary Expense Calculator'),
    ('Bonus 2, Personal Financial Assessment', 'Bonus 2: Personal Financial Assessment'),
    ('Full Bundle, The Salary-To-Zero Man + Bonuses', 'Full Bundle: The Salary-To-Zero Man + Bonuses'),

    # Lists with markdown style
    ('</strong>, These are', '</strong>: These are'),
    ('</strong>, The exact', '</strong>: The exact'),
    ('</strong>, Not the generic', '</strong>: Not the generic'),
    ('</strong>, This is the piece', '</strong>: This is the piece'),
    ('</strong>, A specific tool', '</strong>: A specific tool'),
    ('</strong>, What to do', '</strong>: What to do'),
    ('</strong>, A 10-minute', '</strong>: A 10-minute'),

    # Pricing justification
    ('</strong>, I didn\'t just write', '</strong>: I didn\'t just write'),
    ('</strong>, To take my rough', '</strong>: To take my rough'),
    ('</strong>, To make the guide', '</strong>: To make the guide'),
    ('</strong>, Before publishing', '</strong>: Before publishing'),
    ('</strong>, To make this available', '</strong>: To make this available'),

    # Pg replacements
    (', <em>Pg', '(See Pg'),
    ('</em></li>', '</em>)</li>'),

    # Others
    ('NOW, ₦8,900 Only', 'NOW for ₦8,900 Only'),
    ('every month, automatically.', 'every month, automatically.'),
    ('assessment, a tailored review', 'assessment, which is a tailored review'),
    ('Rescue, Buyers', 'Rescue - Buyers'),
    ('Bear in mind, you are', 'Bear in mind that you are'),
    ('Gone, ₦8,900', 'Gone for ₦8,900'),
    ('new, especially around money, takes', 'new, especially around money, takes'),
    ('salary moves, if you cannot point to at least one week where your account behaved differently than before, simply send', 'salary moves, or if you cannot point to at least one week where your account behaved differently than before, simply send'),
    ('Yes, I Want This', 'Yes, I Want This'),
    ('spending, the small things', 'spending, the small things'),
    ('about money, it is about', 'about money, it is about'),
    ('Firewall section, I had no', 'Firewall section. I had no'),
    ('payday has, or whether', 'payday has, or whether'),
    ('YES, I Want', 'YES, I Want'),
    (', all handled by Selar', ' (all handled by Selar)'),

    # Cost line
    ('₦120,000, even though', '₦120,000, even though'),
]

# Do global replacements first for the dashes
content = content.replace(' — ', ' , ')
content = content.replace(' —', ' ,')
content = content.replace('— ', ', ')
content = content.replace('—', ',')

# Let's write a better approach:
# Instead of raw replace, let's just do exact string replacements before replacing all remaining — with ,
