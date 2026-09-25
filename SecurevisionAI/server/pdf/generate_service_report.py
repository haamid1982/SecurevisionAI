import json,sys
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER,TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,Image,PageBreak,KeepTogether

with open(sys.argv[1],encoding="utf-8") as handle:
    d=json.load(handle)

RED=colors.HexColor("#ed1b2f"); DARK=colors.HexColor("#101114"); GREY=colors.HexColor("#666b73"); LIGHT=colors.HexColor("#f1f2f4")
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleWhite",parent=styles["Title"],textColor=colors.white,fontSize=19,leading=23))
styles.add(ParagraphStyle(name="Section",parent=styles["Heading2"],fontSize=13,leading=16,textColor=DARK,spaceBefore=10,spaceAfter=7))
styles.add(ParagraphStyle(name="BodySmall",parent=styles["BodyText"],fontSize=8.5,leading=12,textColor=GREY))
styles.add(ParagraphStyle(name="Tiny",parent=styles["BodyText"],fontSize=7.5,leading=10,textColor=GREY))

def val(value,fallback="-"):
    return str(value) if value not in (None,"") else fallback
def dt(value):
    if not value:return "-"
    try:return datetime.fromisoformat(value.replace("Z","+00:00")).strftime("%d %b %Y, %H:%M")
    except:return str(value)
def p(value,style="BodyText"):return Paragraph(val(value).replace("\n","<br/>"),styles[style])
def section(title):return [Paragraph(title.upper(),styles["Section"]),Table([[""]],colWidths=[174*mm],rowHeights=[1.2*mm],style=[("BACKGROUND",(0,0),(-1,-1),RED)])]

def footer(canvas,doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#dddddd"));canvas.line(18*mm,14*mm,192*mm,14*mm)
    canvas.setFont("Helvetica",7);canvas.setFillColor(GREY)
    canvas.drawString(18*mm,9*mm,"Generated securely by SecureVision AI")
    canvas.drawRightString(192*mm,9*mm,f"Page {doc.page}")
    canvas.restoreState()

doc=SimpleDocTemplate(sys.argv[2],pagesize=A4,rightMargin=18*mm,leftMargin=18*mm,topMargin=16*mm,bottomMargin=19*mm,title=f"Service Report {d.get('reference','')}")
story=[]
company=d.get("company",{});customer=d.get("customer",{});site=d.get("site",{});assets=d.get("assets",{})
logo=Image(assets["logo"],width=42*mm,height=18*mm,kind="proportional") if assets.get("logo") else Paragraph(company.get("name",""),styles["TitleWhite"])
header=Table([[logo,Paragraph("SERVICE REPORT",styles["TitleWhite"])],[p(company.get("name"),"Tiny"),Paragraph(val(d.get("reference")),ParagraphStyle(name="Ref",parent=styles["BodyText"],alignment=TA_RIGHT,textColor=colors.white,fontSize=10))]],colWidths=[90*mm,84*mm])
header.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),DARK),("BOX",(0,0),(-1,-1),0,DARK),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("ALIGN",(1,0),(1,-1),"RIGHT"),("LEFTPADDING",(0,0),(-1,-1),8),("RIGHTPADDING",(0,0),(-1,-1),8),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),("LINEBELOW",(0,-1),(-1,-1),3,RED)]))
story += [header,Spacer(1,7*mm)]

info=[[p("<b>Customer</b>","BodySmall"),p("<b>Site</b>","BodySmall"),p("<b>Job details</b>","BodySmall")],
      [p(f"{val(customer.get('company'))}<br/>{val(customer.get('name'))}<br/>{val(customer.get('address'))}","BodySmall"),p(f"{val(site.get('name'))}<br/>{val(site.get('address'))}<br/>{val(site.get('postcode'))}","BodySmall"),p(f"<b>{val(d.get('title'))}</b><br/>{val(d.get('jobType'))} | {val(d.get('priority'))}<br/>Engineer: {val(d.get('engineerName'))}<br/>Completed: {dt(d.get('completedAt'))}","BodySmall")]]
t=Table(info,colWidths=[58*mm,58*mm,58*mm]);t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),LIGHT),("BOX",(0,0),(-1,-1),.5,colors.HexColor("#d4d6da")),("INNERGRID",(0,0),(-1,-1),.5,colors.HexColor("#d4d6da")),("VALIGN",(0,0),(-1,-1),"TOP"),("PADDING",(0,0),(-1,-1),7)]));story.append(t)

story += section("Work completed")+[p(d.get("workSummary"))]
if d.get("furtherWorkRequired"):story += section("Further work required")+[p(d["furtherWorkRequired"])]

story += section("Completion checklist")
checks=[[Paragraph("<b>Check</b>",styles["BodySmall"]),Paragraph("<b>Result</b>",styles["BodySmall"])]]
for item in d.get("checklist",[]):checks.append([p(item.get("label"),"BodySmall"),p("PASS" if item.get("checked") else "INCOMPLETE","BodySmall")])
ct=Table(checks,colWidths=[145*mm,29*mm],repeatRows=1);ct.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),LIGHT),("GRID",(0,0),(-1,-1),.4,colors.HexColor("#d4d6da")),("TEXTCOLOR",(1,1),(1,-1),colors.HexColor("#168346")),("PADDING",(0,0),(-1,-1),5)]));story.append(ct)

equipment=d.get("equipment",[])
if equipment:
    story += section("Equipment and parts")
    rows=[[p("<b>Description</b>","Tiny"),p("<b>Make / model</b>","Tiny"),p("<b>Serial number</b>","Tiny"),p("<b>Qty</b>","Tiny")]]
    for item in equipment:rows.append([p(item.get("description"),"Tiny"),p(" / ".join(filter(None,[item.get("manufacturer"),item.get("model")])),"Tiny"),p(item.get("serialNumber"),"Tiny"),p(item.get("quantity"),"Tiny")])
    et=Table(rows,colWidths=[60*mm,48*mm,48*mm,18*mm],repeatRows=1);et.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),LIGHT),("GRID",(0,0),(-1,-1),.4,colors.HexColor("#d4d6da")),("VALIGN",(0,0),(-1,-1),"TOP"),("PADDING",(0,0),(-1,-1),5)]));story.append(et)

story += section("Customer sign-off")
sig=Image(assets["signature"],width=55*mm,height=18*mm,kind="proportional") if assets.get("signature") else p("No signature")
sign=Table([[p(f"<b>Signed by:</b> {val(d.get('customerName'))}<br/><b>Date:</b> {dt(d.get('signedAt'))}","BodySmall"),sig]],colWidths=[105*mm,69*mm]);sign.setStyle(TableStyle([("BOX",(0,0),(-1,-1),.5,colors.HexColor("#d4d6da")),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("PADDING",(0,0),(-1,-1),8)]));story.append(sign)

photos=d.get("photos",[])
if photos:
    story += [PageBreak()]+section("Site photo evidence")
    cells=[]
    for index,item in enumerate(photos):
        path=assets.get("photos",[])[index]
        block=[Image(path,width=80*mm,height=55*mm,kind="proportional"),Spacer(1,2*mm),p(item.get("caption") or f"Site photo {index+1}","Tiny")]
        cells.append(block)
    for i in range(0,len(cells),2):
        row=cells[i:i+2]
        if len(row)<2:row.append("")
        grid=Table([row],colWidths=[87*mm,87*mm]);grid.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("BOX",(0,0),(-1,-1),.4,colors.HexColor("#d4d6da")),("INNERGRID",(0,0),(-1,-1),.4,colors.HexColor("#d4d6da")),("PADDING",(0,0),(-1,-1),5)]));story += [grid,Spacer(1,5*mm)]

doc.build(story,onFirstPage=footer,onLaterPages=footer)
