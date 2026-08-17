from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "msv-member-portal-whitepaper.pdf"
LOGO = ROOT / "public" / "images" / "msv-logo.png"

GREEN = colors.HexColor("#075313")
DARK_GREEN = colors.HexColor("#063D1F")
GOLD = colors.HexColor("#C5A91B")
PALE_GREEN = colors.HexColor("#EDF4EB")
PALE_GOLD = colors.HexColor("#F5EFCF")
TEXT = colors.HexColor("#26352B")
MUTED = colors.HexColor("#607065")
LINE = colors.HexColor("#D5DED2")


def footer(canvas, doc):
    canvas.saveState()
    width, _ = A4
    canvas.setStrokeColor(LINE)
    canvas.line(20 * mm, 15 * mm, width - 20 * mm, 15 * mm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 10 * mm, "Mindoro Supporting Varsitarian, Inc. - Member Portal White Paper")
    canvas.drawRightString(width - 20 * mm, 10 * mm, f"Page {doc.page}")
    canvas.restoreState()


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="CoverTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=29,
        leading=34,
        textColor=DARK_GREEN,
        alignment=TA_CENTER,
        spaceAfter=10 * mm,
    )
)
styles.add(
    ParagraphStyle(
        name="TableCell",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=7.4,
        leading=10,
        textColor=TEXT,
    )
)
styles.add(
    ParagraphStyle(
        name="TableHeader",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=7.4,
        leading=10,
        textColor=colors.white,
    )
)
styles.add(
    ParagraphStyle(
        name="CoverSubtitle",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=12,
        leading=18,
        textColor=MUTED,
        alignment=TA_CENTER,
    )
)
styles.add(
    ParagraphStyle(
        name="Section",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=25,
        textColor=DARK_GREEN,
        spaceBefore=4 * mm,
        spaceAfter=4 * mm,
    )
)
styles.add(
    ParagraphStyle(
        name="Subsection",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=GREEN,
        spaceBefore=4 * mm,
        spaceAfter=2 * mm,
    )
)
styles.add(
    ParagraphStyle(
        name="Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=TEXT,
        spaceAfter=3 * mm,
    )
)
styles.add(
    ParagraphStyle(
        name="Small",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=MUTED,
    )
)
styles.add(
    ParagraphStyle(
        name="Callout",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=15,
        textColor=DARK_GREEN,
        borderColor=GOLD,
        borderWidth=1,
        borderPadding=10,
        backColor=PALE_GOLD,
        spaceBefore=4 * mm,
        spaceAfter=5 * mm,
    )
)


def p(text, style="Body"):
    return Paragraph(text, styles[style])


def bullets(items):
    return [Paragraph(f"&bull;&nbsp; {item}", styles["Body"]) for item in items]


def section(number, title, intro):
    return [p(f"SECTION {number}", "Small"), p(title, "Section"), p(intro), Spacer(1, 2 * mm)]


def styled_table(data, widths, header=True):
    wrapped = []
    for row_index, row in enumerate(data):
        style = styles["TableHeader"] if header and row_index == 0 else styles["TableCell"]
        wrapped.append([cell if not isinstance(cell, str) else Paragraph(cell, style) for cell in row])
    table = Table(wrapped, colWidths=widths, repeatRows=1 if header else 0, hAlign="LEFT")
    commands = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TEXTCOLOR", (0, 0), (-1, -1), TEXT),
    ]
    if header:
        commands.extend(
            [
                ("BACKGROUND", (0, 0), (-1, 0), GREEN),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ]
        )
    for row in range(1 if header else 0, len(data)):
        if row % 2 == 0:
            commands.append(("BACKGROUND", (0, row), (-1, row), PALE_GREEN))
    table.setStyle(TableStyle(commands))
    return table


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=22 * mm,
        title="MSV Member Portal White Paper",
        author="Mindoro Supporting Varsitarian, Inc.",
        subject="User guide, capabilities, security, capacity, and deployment guidance",
    )

    story = []
    if LOGO.exists():
        logo = Image(str(LOGO), width=48 * mm, height=48 * mm)
        logo.hAlign = "CENTER"
        story.extend([Spacer(1, 18 * mm), logo, Spacer(1, 10 * mm)])
    story.extend(
        [
            p("MSV MEMBER PORTAL", "Small"),
            p("One portal. Clear records.<br/>Accountable service.", "CoverTitle"),
            p(
                "The official public guide to using the Mindoro Supporting Varsitarian Member Portal - including its roles, features, safeguards, measured capacity, and deployment requirements.",
                "CoverSubtitle",
            ),
            Spacer(1, 16 * mm),
            styled_table(
                [
                    ["Document", "System White Paper"],
                    ["Release", "Version 1.0 - August 2026"],
                    ["Audience", "Members, officers, administrators, and stakeholders"],
                    ["Access", "Public reference - contains no private member data"],
                ],
                [40 * mm, 100 * mm],
                header=False,
            ),
            Spacer(1, 18 * mm),
            p("Mindoro Supporting Varsitarian, Inc.", "CoverSubtitle"),
            PageBreak(),
        ]
    )

    story.extend(section("01", "Purpose and scope", "A secure operating record for membership, transparency, and accountable organizational service."))
    story.append(
        p(
            "The portal centralizes membership applications, account decisions, published financial information, personal payment history, disciplinary records, and audit activity. Approved members receive transparent read-only access, while administrative responsibilities are separated by role."
        )
    )
    story.extend(
        bullets(
            [
                "One protected identity across all modules.",
                "Pending approval before organizational records become available.",
                "Server-enforced roles for Members, Admins, and Managers.",
                "Traceable changes and voiding instead of silent deletion.",
                "Public documentation without exposure of private member information.",
            ]
        )
    )
    story.append(p("The portal supplements organizational policy. It does not replace formal governance, financial review, or disciplinary due process.", "Callout"))

    story.extend(section("02", "How to use the portal", "The normal member journey from application to everyday access."))
    steps = [
        ["1", "Create an account", "Submit your name, email address, and a secure password through the registration page."],
        ["2", "Verify your email", "Open the verification link sent to the registered email address."],
        ["3", "Wait for approval", "An Admin or Manager reviews the application. Pending users cannot enter protected modules."],
        ["4", "Open the dashboard", "After approval, sign in and use the role-appropriate dashboard and navigation."],
        ["5", "Review records", "View published finances, personal payments, disciplinary information, and account settings."],
        ["6", "Log out", "End the authenticated session when using a shared or public device."],
    ]
    story.append(styled_table([["Step", "Action", "What happens"], *steps], [13 * mm, 42 * mm, 105 * mm]))

    story.extend(section("03", "Roles and permissions", "Responsibilities are separated so users receive only the access required for their work."))
    role_data = [
        ["Role", "Primary purpose", "Key permissions"],
        ["Member", "Transparency and personal history", "View published finances, own payments, disciplinary records, profile, and password settings."],
        ["Admin", "Operational administration", "Review applications; manage member status, payments, and disciplinary records."],
        ["Manager", "Organization-wide oversight", "All Admin capabilities plus financial CRUD, role administration, council assignments, and audit logs."],
    ]
    story.append(styled_table(role_data, [25 * mm, 50 * mm, 85 * mm]))
    story.append(Spacer(1, 5 * mm))
    matrix = [
        ["Capability", "Member", "Admin", "Manager"],
        ["View published finances", "Yes", "Yes", "Yes"],
        ["View own payment history", "Yes", "Yes", "Yes"],
        ["Manage members", "No", "Yes", "Yes"],
        ["Manage payments and discipline", "No", "Yes", "Yes"],
        ["Manage financial records", "No", "No", "Yes"],
        ["Manage roles and view audits", "No", "No", "Yes"],
    ]
    story.append(styled_table(matrix, [82 * mm, 26 * mm, 26 * mm, 26 * mm]))
    story.append(PageBreak())

    story.extend(section("04", "Feature catalogue", "The modules share one identity, permissions, and audit model."))
    feature_groups = [
        ("Registration and membership", ["Pending-by-default registration", "Email verification", "Approval and rejection with reasons", "Suspension, reactivation, and deactivation", "Role, status, and council history"]),
        ("Financial transparency", ["Income and expense records", "Balance summaries", "Categories, references, and notes", "Published and draft states", "Manager-only financial management"]),
        ("Payments", ["Amount due and paid", "Paid, Unpaid, and Pending statuses", "Payment date and reference", "Member-only personal history", "Admin and Manager management"]),
        ("Disciplinary records", ["Generated case numbers", "Violation types and incident dates", "Descriptions and actions taken", "Case statuses", "Read-only member access"]),
        ("Dashboards and audit", ["Member and administrative dashboards", "Membership and financial summaries", "Recent Manager activity", "Before-and-after audit values", "IP address and user-agent tracking"]),
        ("REST API", ["Registration, login, logout, and approval", "Payment, financial, and disciplinary resources", "Sanctum bearer tokens", "Role authorization", "Pagination capped at 100 records"]),
    ]
    for index in range(0, len(feature_groups), 2):
        row = []
        for title, items in feature_groups[index : index + 2]:
            row.append([p(title, "Subsection"), *bullets(items)])
        story.append(Table([row], colWidths=[80 * mm, 80 * mm], style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("BOX", (0, 0), (-1, -1), 0.5, LINE), ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE), ("BACKGROUND", (0, 0), (-1, -1), colors.white), ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8)])))
        story.append(Spacer(1, 4 * mm))

    story.extend(section("05", "Security and data integrity", "Security decisions are enforced by the application server, not only by visible interface controls."))
    security = [
        ["Control", "Implementation"],
        ["Authentication", "Hashed passwords, verification, secure reset workflow, sessions, and Sanctum tokens."],
        ["Authorization", "Role middleware and model policies protect both pages and direct URLs."],
        ["Account state", "Pending, rejected, suspended, and deactivated users are denied protected access."],
        ["Payment privacy", "Members can retrieve only payment records associated with their own profile."],
        ["Record integrity", "Financial, payment, and disciplinary records require a reason when voided."],
        ["Traceability", "Audits preserve actor, action, entity, old values, new values, IP, and user agent."],
        ["Abuse controls", "Authentication rate limits protect individual accounts while supporting shared-office IPs."],
    ]
    story.append(styled_table(security, [42 * mm, 118 * mm]))
    story.append(PageBreak())

    story.extend(section("06", "Capacity and performance", "The portal is optimized toward a 250-user burst profile, but capacity must be certified on the deployed server."))
    capacity = [
        ["Metric", "Best local result"],
        ["Virtual users", "250"],
        ["Total requests", "1,000"],
        ["Successful requests", "985 / 1,000 (98.5%)"],
        ["Throughput", "27.65 requests per second"],
        ["Median latency", "2.75 seconds"],
        ["Environment", "Local XAMPP / Windows Apache"],
    ]
    story.append(styled_table(capacity, [65 * mm, 95 * mm]))
    story.append(
        p(
            "These figures are engineering evidence, not a production guarantee. The test created 250 simultaneous workflows, which is more severe than ordinary use because real members pause to read. Remaining local failures were associated with the XAMPP worker pool. Hostinger staging must repeat the test before a guaranteed capacity is published.",
            "Callout",
        )
    )
    story.append(p("Recommended acceptance criteria", "Subsection"))
    story.extend(bullets(["At least 99% successful requests.", "No HTTP 500 or 503 responses.", "Median latency below one second.", "95th-percentile latency below three seconds.", "Stable database, queue, CPU, memory, and PHP-worker usage."]))

    story.extend(section("07", "Production deployment", "A secure release requires correct server boundaries, configuration, mail, queues, caching, and monitoring."))
    deploy = [
        ["Area", "Requirement"],
        ["Web root", "Serve only the public directory."],
        ["Environment", "APP_ENV=production, APP_DEBUG=false, HTTPS URL, unique application key."],
        ["Sessions and cache", "Prefer Redis on a VPS; use file storage only on a single-server deployment."],
        ["Queues", "Run a supervised worker for notifications and background jobs."],
        ["Mail", "Configure SMTP and test verification, approval, and password-reset delivery."],
        ["Database", "Back up before migrations; apply schema changes with Artisan."],
        ["Filesystem", "Create the storage link and grant write access only to storage and bootstrap/cache."],
        ["Operations", "Monitor HTTP errors, queue failures, slow requests, resources, and backups."],
    ]
    story.append(styled_table(deploy, [42 * mm, 118 * mm]))

    story.extend(section("08", "Frequently asked questions", "Current operating rules for members and officers."))
    faqs = [
        ("Why is my account pending?", "Every application requires review. Protected access begins only after approval and verification."),
        ("Who can edit financial records?", "Only the Manager can create, update, or void financial records."),
        ("Can another member see my payments?", "No. Members see only their own payment history."),
        ("Are records permanently deleted?", "Business records are voided with a reason and retained for accountability."),
        ("Does 250 users mean 250 requests at one instant?", "No. Ordinary active users pause between requests; a concurrency test intentionally creates a severe burst."),
    ]
    for question, answer in faqs:
        story.append(KeepTogether([p(question, "Subsection"), p(answer)]))

    story.append(Spacer(1, 8 * mm))
    story.append(p("Document control", "Section"))
    story.append(p("Version 1.0 - August 2026. Public system guide. This document contains no private member records, credentials, application secrets, or protected database contents."))

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(OUTPUT)


if __name__ == "__main__":
    build()
