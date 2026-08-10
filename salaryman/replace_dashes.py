import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Exact replacements to fix formatting and remove markdown-style elements
exact_replacements = [
    # Header and Titles
    ('30 Days — Even If', '30 Days, Even If'),
    ('SECTION 1 — BLOG', 'SECTION 1 - BLOG'),
    ('SECTION 2 — STORY', 'SECTION 2 - STORY'),
    ('SECTION 3 — HERO', 'SECTION 3 - HERO'),
    ('SECTION 4 — THE OPENING', 'SECTION 4 - THE OPENING'),
    ('SECTION 5 — THE PROMISE', 'SECTION 5 - THE PROMISE'),
    ('SECTION 6 — THE AUTHORITY', 'SECTION 6 - THE AUTHORITY'),
    ('SECTION 7 — PERSONA', 'SECTION 7 - PERSONA'),
    ('SECTION 8 — THE FULL', 'SECTION 8 - THE FULL'),
    ('SECTION 9 — THE PRODUCT', 'SECTION 9 - THE PRODUCT'),
    ('SECTION 10 — PRODUCT', 'SECTION 10 - PRODUCT'),
    ('SECTION 11 — WHAT IS', 'SECTION 11 - WHAT IS'),
    ('SECTION 12 — TESTIMONIALS', 'SECTION 12 - TESTIMONIALS'),
    ('SECTION 13 — COST', 'SECTION 13 - COST'),
    ('SECTION 14 — FIRST', 'SECTION 14 - FIRST'),
    ('SECTION 15 — BONUS', 'SECTION 15 - BONUS'),
    ('SECTION 16 — SECOND', 'SECTION 16 - SECOND'),
    ('SECTION 17 — WHATSAPP', 'SECTION 17 - WHATSAPP'),
    ('SECTION 18 — MONEY-BACK', 'SECTION 18 - MONEY-BACK'),
    ('SECTION 19 — SECOND', 'SECTION 19 - SECOND'),
    ('SECTION 20 — TWO-CHOICE', 'SECTION 20 - TWO-CHOICE'),
    ('SECTION 21 — FINAL', 'SECTION 21 - FINAL'),

    # Story fixes
    ('friend a man named <strong>Chief Amu</strong> — was visiting', 'friend, a man named <strong>Chief Amu</strong>, was visiting'),
    ('answer — the one I had', 'answer, the one I had'),
    ('structuring — paying yourself', 'structuring: paying yourself'),
    ('app — the way I did every morning, braced for the number — and', 'app, the way I did every morning, braced for the number, and'),

    # Image alts
    ('Salary-To-Zero Man — PDF Guide', 'Salary-To-Zero Man PDF Guide'),
    ('Bonus 1 — Salary Expense Calculator', 'Bonus 1: Salary Expense Calculator'),
    ('Bonus 2 — Personal Financial Assessment', 'Bonus 2: Personal Financial Assessment'),
    ('Full Bundle — The Salary-To-Zero Man + Bonuses', 'Full Bundle: The Salary-To-Zero Man + Bonuses'),

    # Markdown style lists
    ('</strong> — These are', '</strong>: These are'),
    ('</strong> — The exact', '</strong>: The exact'),
    ('</strong> — Not the generic', '</strong>: Not the generic'),
    ('</strong> — This is the piece', '</strong>: This is the piece'),
    ('</strong> — A specific tool', '</strong>: A specific tool'),
    ('</strong> — What to do', '</strong>: What to do'),
    ('</strong> — A 10-minute', '</strong>: A 10-minute'),

    ('</strong> — I didn\'t just', '</strong>: I didn\'t just'),
    ('</strong> — To take my rough', '</strong>: To take my rough'),
    ('</strong> — To make the guide', '</strong>: To make the guide'),
    ('</strong> — Before publishing', '</strong>: Before publishing'),
    ('</strong> — To make this available', '</strong>: To make this available'),

    # Pg fixes (also markdown style)
    (' — <em>Pg. 2</em>', ' (See Pg. 2)'),
    (' — <em>Pg. 8</em>', ' (See Pg. 8)'),
    (' — <em>Pg. 14</em>', ' (See Pg. 14)'),
    (' — <em>Pg. 22</em>', ' (See Pg. 22)'),
    (' — <em>Pg. 31</em>', ' (See Pg. 31)'),
    (' — <em>Pg. 38</em>', ' (See Pg. 38)'),
    (' — <em>Pg. 44</em>', ' (See Pg. 44)'),

    # CTA & others
    ('NOW — ₦8,900 Only', 'NOW for ₦8,900 Only'),
    ('every month — automatically.', 'every month, automatically.'),
    ('assessment — a tailored review', 'assessment, which is a tailored review'),
    ('Rescue — Buyers', 'Rescue - Buyers'),
    ('Bear in mind — you are', 'Bear in mind that you are'),
    ('Gone — ₦8,900', 'Gone for ₦8,900'),
    ('new — especially around money — takes', 'new, especially around money, takes'),
    ('salary moves — if you cannot point to at least one week where your account behaved differently than before — simply send', 'salary moves, or if you cannot point to at least one week where your account behaved differently than before, simply send'),
    ('Yes — I Want This', 'Yes, I Want This'),
    ('spending — the small things', 'spending, the small things'),
    ('about money — it is about', 'about money, it is about'),
    ('Firewall section — I had no', 'Firewall section. I had no'),
    ('payday has — or whether', 'payday has, or whether'),
    ('YES — I Want', 'YES, I Want'),
    ('USSD — all handled', 'USSD (all handled'),
    ('₦120,000 — even though', '₦120,000, even though'),
    ('JAVASCRIPT — WhatsApp', 'JAVASCRIPT - WhatsApp'),
]

for old, new in exact_replacements:
    content = content.replace(old, new)

# Catch any remaining em dashes
content = content.replace(' — ', ', ')
content = content.replace('—', '-')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacements complete!")
