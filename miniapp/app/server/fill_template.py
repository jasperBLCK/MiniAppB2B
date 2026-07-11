"""
Заполняет DOCX-шаблон заявки и конвертирует в PDF через Microsoft Word (COM).
Шрифт шаблона: Times New Roman 10.5pt. Выравнивание по оригиналу.
Вызов: python fill_template.py '<json_data>' '<output_pdf_path>'
"""
import sys
import json
import os
import shutil
from datetime import datetime

def format_date(s):
    if not s:
        return ''
    try:
        d = datetime.strptime(s[:10], '%Y-%m-%d')
        return d.strftime('%d.%m.%Y')
    except:
        return s

def format_money(n):
    try:
        n = float(n or 0)
        return '{:,.2f}'.format(n).replace(',', ' ').replace('.', ',')
    except:
        return str(n)

def replace_in_run(run, old, new):
    if old in run.text:
        run.text = run.text.replace(old, new)

def replace_in_para(para, replacements):
    full = ''.join(r.text for r in para.runs)
    for old, new in replacements.items():
        if old in full:
            full = full.replace(old, str(new))
    # Записываем обратно в первый run, остальные очищаем
    if para.runs:
        para.runs[0].text = full
        for r in para.runs[1:]:
            r.text = ''

def set_para_text(para, text):
    """Заменяет текст параграфа, полностью сохраняя форматирование первого run."""
    import copy
    if not para.runs:
        return
    # Копируем XML первого run как образец форматирования
    src_run = para.runs[0]
    # Очищаем все runs
    for r in para.runs:
        r.text = ''
    # Ставим текст в первый run
    para.runs[0].text = text


def fill_docx(template_path, output_path, data):
    import docx
    from docx.shared import Mm
    from docx.oxml import OxmlElement
    doc = docx.Document(template_path)

    contract_number = data.get('contract_number', '')
    contract_date   = format_date(data.get('contract_date', ''))
    company_name    = data.get('company_name', '')
    payment_number  = str(data.get('payment_number', ''))
    payment_date    = format_date(data.get('payment_date', ''))
    deadline_date   = format_date(data.get('deadline_date', '') or data.get('payment_date', ''))

    amount          = format_money(data.get('amount', 0))
    currency        = data.get('currency', 'USD')
    currency_name   = 'долларов' if currency == 'USD' else 'евро' if currency == 'EUR' else currency
    currency_unit   = 'доллар США' if currency == 'USD' else 'евро' if currency == 'EUR' else currency
    exchange_rate   = format_money(data.get('exchange_rate', 0))
    rub_amount      = format_money(data.get('rub_amount', 0))
    amount_words    = data.get('amount_words', '')
    product_name    = data.get('product_name', '')
    payment_purpose = data.get('payment_purpose', '')

    recipient_name         = data.get('recipient_name', '')
    recipient_address      = data.get('recipient_address', '')
    recipient_bank         = data.get('recipient_bank', '')
    recipient_bank_address = data.get('recipient_bank_address', '')
    recipient_iban         = data.get('recipient_iban', '')
    recipient_swift        = data.get('recipient_swift', '')
    contract_details       = data.get('contract_details', '')

    # Процент комиссии: убираем лишние нули (1.6 -> "1,6", 2.0 -> "2")
    pct_raw = data.get('commission_percent', 0)
    pct_str = ('{:.10f}'.format(float(pct_raw))).rstrip('0').rstrip('.')
    pct_str = pct_str.replace('.', ',')
    commission_rub    = format_money(data.get('commission_rub', 0))
    total_rub         = format_money(data.get('total_rub', 0))

    principal_name    = data.get('principal_signatory_name', '')
    principal_pos     = data.get('principal_position', 'Генеральный директор')
    agent_name        = data.get('agent_signatory_name', '')
    agent_pos         = data.get('agent_position', 'Управляющий')
    agent_company     = data.get('agent_company_name', '')

    body_text = (
        f'Согласно заключенному Агентскому договору № {contract_number} от {contract_date} года просим перевести '
        f'{amount} {currency_name} по курсу {exchange_rate} рублей за 1 {currency_unit} в сумме '
        f'{rub_amount} рублей ({amount_words}) '
        f'в срок до {deadline_date} г. (включительно) за товар {product_name} '
        f'с назначением «{payment_purpose}» на следующие реквизиты:'
    )

    commission_line = (
        f'Вознаграждение Агента, согласно настоящей заявке, равно {pct_str}% '
        f'от суммы платежа и составляет, соответственно, {commission_rub} руб.'
    )

    total_line = f'Итого общая сумма перевода и вознаграждения Агента: {total_rub} руб.'

    return_clause = (
        f'В случае неисполнения настоящей Заявки в порядке, предусмотренном пунктом 2.5.  '
        f'Агентского договора № {contract_number} от {contract_date} года Агент обязуется возвратить '
        f'сумму перевода, включая сумму вознаграждения Агента, на расчетный счет Принципала.'
    )

    addr_seen = False  # флаг: первый "Адрес:" — получатель, второй — банк

    for para in doc.paragraphs:
        txt = para.text.strip()

        if 'Приложение №1' in txt:
            set_para_text(para, f'Приложение №1 к агентскому договору № {contract_number} от {contract_date} года')

        elif txt.startswith('в адрес'):
            set_para_text(para, f'в адрес компании «{company_name}»')

        elif txt == '(ФОРМА)':
            # Убираем строку (ФОРМА)
            set_para_text(para, '')

        elif txt.startswith('Заявка №'):
            set_para_text(para, f'Заявка № {payment_number} от {payment_date} г.')

        elif txt.startswith('Согласно заключенному'):
            set_para_text(para, body_text)

        elif txt == 'Получатель:':
            set_para_text(para, f'Получатель: {recipient_name}')

        elif txt == 'Адрес:':
            if not addr_seen:
                set_para_text(para, f'Адрес: {recipient_address}')
                addr_seen = True
            else:
                set_para_text(para, f'Адрес: {recipient_bank_address}')

        elif txt == 'Банк:':
            set_para_text(para, f'Банк: {recipient_bank}')

        elif txt == 'IBAN:':
            set_para_text(para, f'IBAN: {recipient_iban}')

        elif txt == 'SWIFT:':
            set_para_text(para, f'SWIFT: {recipient_swift}')

        elif txt.startswith('Вознаграждение'):
            set_para_text(para, commission_line)

        elif txt.startswith('Итого'):
            set_para_text(para, total_line)

        elif txt.startswith('В случае'):
            set_para_text(para, return_clause)

        elif txt.startswith('Принципала'):
            set_para_text(para, f'Принципала {principal_name}')

    # Контракт — вставляем в пустой параграф после SWIFT
    if contract_details:
        swift_idx = None
        for i, para in enumerate(doc.paragraphs):
            if para.text.strip().startswith('SWIFT:'):
                swift_idx = i
                break
        if swift_idx is not None and swift_idx + 1 < len(doc.paragraphs):
            next_p = doc.paragraphs[swift_idx + 1]
            # Копируем форматирование из SWIFT параграфа
            swift_para = doc.paragraphs[swift_idx]
            if next_p.runs:
                next_p.runs[0].text = f'Контракт: {contract_details}'
                for r in next_p.runs[1:]: r.text = ''
            else:
                run = OxmlElement('w:r')
                t_el = OxmlElement('w:t')
                t_el.text = f'Контракт: {contract_details}'
                run.append(t_el)
                next_p._p.append(run)

    # ── ТАБЛИЦА ПОДПИСАНТОВ ──
    # Cell 0 (Агент):    [0]='Агент' [1]='' [2]='___'(подпись) [3]='' [4]='' [5]='Директор' [6]='' [7]='' [8]='___'(ФИО)
    # Cell 1 (Принципал):[0]='Принципал' [1]='___'(линия) [2]='' [3]='' [4]='Ген.директор' [5]='' [6]='' [7]='___'(ФИО)

    sig_path   = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'signature.png')
    stamp_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'stamp.png')

    for table in doc.tables:
        pa = table.rows[0].cells[0].paragraphs  # Агент
        pp = table.rows[0].cells[1].paragraphs  # Принципал

        # АГЕНТ para[0] — оставляем "Агент"

        # para[1] — название компании агента (если есть)
        if len(pa) > 1 and agent_company:
            if pa[1].runs:
                pa[1].runs[0].text = agent_company
                for r in pa[1].runs[1:]: r.text = ''
            else:
                run = OxmlElement('w:r'); t_el = OxmlElement('w:t')
                t_el.text = agent_company; run.append(t_el); pa[1]._p.append(run)

        # para[2] — подпись + печать
        if len(pa) > 2:
            for r in pa[2].runs: r.text = ''
            if os.path.exists(sig_path):
                pa[2].add_run().add_picture(sig_path, width=Mm(38))
            if os.path.exists(stamp_path):
                pa[2].add_run().add_picture(stamp_path, width=Mm(22))

        # para[5] — должность агента
        if len(pa) > 5:
            set_para_text(pa[5], agent_pos)

        # para[8] — ФИО агента
        if len(pa) > 8:
            set_para_text(pa[8], agent_name)

        # ПРИНЦИПАЛ para[0] — оставляем "Принципал"

        # para[1] — линия (оставляем пустой — линия нарисована в шаблоне)
        if len(pp) > 1:
            set_para_text(pp[1], '')

        # para[4] — должность принципала
        if len(pp) > 4:
            set_para_text(pp[4], principal_pos)

        # para[7] — ФИО принципала
        if len(pp) > 7:
            set_para_text(pp[7], principal_name)

        break  # только первая таблица

    doc.save(output_path)
    return output_path


def docx_to_pdf(docx_path, pdf_path):
    """Конвертация через Microsoft Word COM (Windows)"""
    import win32com.client
    import pythoncom
    pythoncom.CoInitialize()
    word = win32com.client.Dispatch('Word.Application')
    word.Visible = False
    try:
        doc = word.Documents.Open(os.path.abspath(docx_path))
        doc.SaveAs(os.path.abspath(pdf_path), FileFormat=17)  # 17 = wdFormatPDF
        doc.Close()
    finally:
        word.Quit()
        pythoncom.CoUninitialize()


if __name__ == '__main__':
    data = json.loads(sys.argv[1])
    output_pdf = sys.argv[2]

    template_src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'template_application.docx')

    tmp_docx = output_pdf.replace('.pdf', '_tmp.docx')

    fill_docx(template_src, tmp_docx, data)
    docx_to_pdf(tmp_docx, output_pdf)
    os.remove(tmp_docx)
    print('OK:' + output_pdf)
