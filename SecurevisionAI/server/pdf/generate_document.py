import json, sys
from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image

source, target = sys.argv[1], sys.argv[2]
with open(source, encoding="utf-8") as handle:
    data = json.load(handle)

red = colors.HexColor("#ed1b2f")
ink = colors.HexColor("#141519")
muted = colors.HexColor("#666970")
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="Right", parent=styles["Normal"], alignment=TA_RIGHT, textColor=muted))
styles.add(ParagraphStyle(name="Small", parent=styles["Normal"], fontSize=8, leading=11, textColor=muted))
doc = SimpleDocTemplate(target, pagesize=A4, rightMargin=18*mm, leftMargin=18*mm, topMargin=16*mm, bottomMargin=16*mm)
story = []
logo = data.get("logo")
brand = Image(logo, width=52*mm, height=28*mm, kind="proportional") if logo else Paragraph("<b>SECURE<span color='#ed1b2f'>VISION AI</span></b>", styles["Title"])
header = Table([[brand, Paragraph(f"<b>{data['type'].upper()}</b><br/>{data['reference']}<br/><font size='8'>Status: {data['status']}</font>", styles["Right"])]], colWidths=[105*mm, 55*mm])
header.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"MIDDLE"),("LINEBELOW",(0,0),(-1,-1),1.5,red),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
story += [header, Spacer(1, 9*mm)]
company = data["company"]
customer = data["customer"]
address = "<br/>".join(filter(None,[customer.get("name"),customer.get("contact"),customer.get("address"),customer.get("email")]))
issuer = "<br/>".join(filter(None,[company.get("name"),company.get("address"),company.get("email"),company.get("phone")]))
meta = [[Paragraph("<b>FROM</b><br/>"+issuer,styles["Normal"]),Paragraph("<b>TO</b><br/>"+address,styles["Normal"])],[Paragraph(f"<b>Issued:</b> {data.get('issued','-')}",styles["Small"]),Paragraph(f"<b>{data.get('dateLabel','Valid until')}:</b> {data.get('dateValue','-')}",styles["Small"])]]
t = Table(meta,colWidths=[80*mm,80*mm],hAlign="LEFT")
t.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("BOX",(0,0),(-1,-1),.5,colors.HexColor('#d9dade')),("INNERGRID",(0,0),(-1,-1),.5,colors.HexColor('#e6e7e9')),("BACKGROUND",(0,1),(-1,1),colors.HexColor('#f5f5f6')),("PADDING",(0,0),(-1,-1),8)]))
story += [t,Spacer(1,8*mm),Paragraph(data.get("title",data["type"].title()),styles["Heading2"]),Spacer(1,3*mm)]
rows=[["Description","Qty","Unit price","Amount"]]
for item in data["items"]:
    rows.append([item["description"],f"{item['quantity']:g}",f"GBP {item['unitPrice']:,.2f}",f"GBP {item['quantity']*item['unitPrice']:,.2f}"])
items=Table(rows,colWidths=[91*mm,18*mm,25*mm,28*mm],repeatRows=1)
items.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),ink),("TEXTCOLOR",(0,0),(-1,0),colors.white),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("ALIGN",(1,1),(-1,-1),"RIGHT"),("GRID",(0,0),(-1,-1),.4,colors.HexColor('#d9dade')),("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,colors.HexColor('#f7f7f8')]),("PADDING",(0,0),(-1,-1),7)]))
story += [items,Spacer(1,6*mm)]
totals=[["Subtotal",f"GBP {data['subtotal']:,.2f}"],["Discount",f"- GBP {data['discount']:,.2f}"],[f"VAT ({data['vatRate']:g}%)",f"GBP {data['vatAmount']:,.2f}"],["TOTAL",f"GBP {data['total']:,.2f}"]]
if data["type"]=="invoice": totals.append(["BALANCE DUE",f"GBP {data['balance']:,.2f}"])
tot=Table(totals,colWidths=[42*mm,35*mm],hAlign="RIGHT")
tot.setStyle(TableStyle([("ALIGN",(0,0),(-1,-1),"RIGHT"),("LINEABOVE",(0,-1),(-1,-1),1.5,red),("FONTNAME",(0,-1),(-1,-1),"Helvetica-Bold"),("FONTSIZE",(0,-1),(-1,-1),11),("PADDING",(0,0),(-1,-1),6)]))
story += [tot,Spacer(1,8*mm)]
if data.get("notes"): story += [Paragraph("<b>Notes</b>",styles["Heading3"]),Paragraph(data["notes"].replace("\n","<br/>"),styles["Normal"]),Spacer(1,5*mm)]
story += [Spacer(1,8*mm),Paragraph("Thank you for choosing "+company.get("name","SecureVision AI")+".",styles["Small"]),Paragraph("Generated securely by SecureVision AI",styles["Small"])]
doc.build(story)
