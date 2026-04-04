from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import datetime
from typing import Dict, Any

def generate_pdf_report(prediction_data: Dict[str, Any], user_data: Dict[str, Any]) -> bytes:
    """Generate a professional medical PDF report"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )

    styles = getSampleStyleSheet()
    story = []

    # Color scheme
    primary_color = colors.HexColor('#1a6b4a')
    accent_color = colors.HexColor('#2ecc71')
    danger_color = colors.HexColor('#e74c3c')
    warning_color = colors.HexColor('#f39c12')
    text_color = colors.HexColor('#2c3e50')

    # --- Header ---
    title_style = ParagraphStyle(
        'Title', parent=styles['Title'],
        fontSize=20, textColor=primary_color,
        spaceAfter=4, alignment=TA_CENTER, fontName='Helvetica-Bold'
    )
    sub_style = ParagraphStyle(
        'Sub', parent=styles['Normal'],
        fontSize=10, textColor=colors.gray,
        alignment=TA_CENTER, spaceAfter=2
    )

    story.append(Paragraph("Early Parkinson's Detection System", title_style))
    story.append(Paragraph("G H Raisoni College of Engineering & Management, Nagpur", sub_style))
    story.append(Paragraph("Medical Analysis Report", sub_style))
    story.append(HRFlowable(width="100%", thickness=2, color=primary_color, spaceAfter=12))

    # --- Patient Info ---
    section_style = ParagraphStyle(
        'Section', parent=styles['Heading2'],
        fontSize=13, textColor=primary_color,
        spaceBefore=12, spaceAfter=6, fontName='Helvetica-Bold'
    )
    normal_style = ParagraphStyle(
        'Normal2', parent=styles['Normal'],
        fontSize=10, textColor=text_color, spaceAfter=3
    )

    story.append(Paragraph("Patient Information", section_style))

    patient_data = [
        ['Name:', user_data.get('name', 'N/A'), 'Report Date:', datetime.now().strftime("%d/%m/%Y %H:%M")],
        ['Email:', user_data.get('email', 'N/A'), 'Age:', str(user_data.get('age', 'N/A'))],
        ['Gender:', user_data.get('gender', 'N/A'), 'Report ID:', str(prediction_data.get('id', 'N/A'))[:12]],
    ]

    patient_table = Table(patient_data, colWidths=[1.2*inch, 2.3*inch, 1.2*inch, 2.3*inch])
    patient_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (-1, -1), text_color),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8f9fa')),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.HexColor('#f8f9fa'), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dee2e6')),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(patient_table)

    # --- Prediction Result ---
    story.append(Spacer(1, 12))
    story.append(Paragraph("Analysis Result", section_style))

    result = prediction_data.get('result', {})
    classification = result.get('classification', 'N/A')
    risk_level = result.get('risk_level', 'N/A')
    confidence = result.get('confidence', 0)
    combined_risk = result.get('combined_risk_score', 0)

    result_color = danger_color if 'Parkinson' in classification else accent_color
    risk_bg = colors.HexColor('#ffeaa7') if risk_level == 'Medium' else (
        colors.HexColor('#fab1a0') if risk_level == 'High' else colors.HexColor('#b2ebf2')
    )

    result_data = [
        ['Classification', 'Risk Level', 'Confidence', 'Combined Risk Score'],
        [classification, risk_level, f"{confidence}%", f"{combined_risk}%"]
    ]

    result_table = Table(result_data, colWidths=[1.8*inch]*4)
    result_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 1), (0, 1), risk_bg),
        ('GRID', (0, 0), (-1, -1), 1, colors.white),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('ROWHEIGHT', (0, 0), (-1, -1), 30),
    ]))
    story.append(result_table)

    # --- Biomarker Scores ---
    story.append(Spacer(1, 12))
    story.append(Paragraph("Biomarker Analysis", section_style))

    voice_score = result.get('voice_risk_score', 0)
    typing_score = result.get('typing_risk_score', 0)
    combined_score = result.get('combined_risk_score', 0)

    biomarker_data = [
        ['Biomarker', 'Score', 'Status'],
        ['Voice Analysis', f"{voice_score}%", get_status(voice_score)],
        ['Typing Dynamics', f"{typing_score}%", get_status(typing_score)],
        ['Combined Assessment', f"{combined_score}%", get_status(combined_score)],
    ]

    biomarker_table = Table(biomarker_data, colWidths=[2.5*inch, 1.5*inch, 3.0*inch])
    biomarker_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (2, -1), 'CENTER'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8f9fa'), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dee2e6')),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(biomarker_table)

    # --- Recommendations ---
    story.append(Spacer(1, 12))
    story.append(Paragraph("Recommendations", section_style))

    recommendations = result.get('recommendations', [])
    for i, rec in enumerate(recommendations, 1):
        story.append(Paragraph(f"{i}. {rec}", normal_style))

    # --- Disclaimer ---
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.gray))
    disclaimer_style = ParagraphStyle(
        'Disclaimer', parent=styles['Normal'],
        fontSize=8, textColor=colors.gray,
        spaceBefore=6, alignment=TA_CENTER
    )
    story.append(Paragraph(
        "DISCLAIMER: This report is generated by an AI system and is intended for screening purposes only. "
        "It does not constitute a medical diagnosis. Please consult a qualified neurologist for professional evaluation.",
        disclaimer_style
    ))
    story.append(Paragraph(
        f"Generated by Early Parkinson's Detection System | GHRCEM Nagpur | {datetime.now().strftime('%d %B %Y')}",
        disclaimer_style
    ))

    doc.build(story)
    return buffer.getvalue()

def get_status(score: float) -> str:
    if score < 30:
        return "✓ Normal"
    elif score < 60:
        return "⚠ Mildly Elevated"
    else:
        return "⚠ Elevated - Consult Doctor"
