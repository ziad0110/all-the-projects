"""
SAS Thermal Printer Module - نظام الطباعة الحرارية
Supports 80mm and 58mm thermal receipt printers via USB or Network.
"""
import os
import subprocess
import tempfile
from datetime import datetime


def format_receipt_text(company, header, lines, width=48):
    """
    Generate plain-text receipt formatted for thermal printers.
    Width: 48 chars for 80mm, 32 chars for 58mm
    """
    sep = "=" * width
    dash = "-" * width
    
    receipt = []
    
    # Company Header
    custom_header = company.get("receipt_header") if company else None
    company_name = custom_header if custom_header else (company.get("name_ar", "SAS") if company else "SAS")
    
    # Handle multi-line header
    for h_line in company_name.split('\n'):
        receipt.append(h_line.strip().center(width))
    
    if company and company.get("tax_number"):
        receipt.append(f"الرقم الضريبي: {company['tax_number']}".center(width))
    if company and company.get("phone"):
        receipt.append(f"هاتف: {company['phone']}".center(width))
    if company and company.get("address_ar"):
        addr = company["address_ar"][:width]
        receipt.append(addr.center(width))
    
    receipt.append(sep)
    
    # Invoice Info
    invoice_number = header.get("invoice_number", "---")
    invoice_date = header.get("invoice_date", datetime.now().strftime("%Y-%m-%d"))
    cashier = header.get("cashier_name", "")
    customer = header.get("customer_name", "عميل نقدي")
    branch = header.get("branch_name", "")
    
    receipt.append(f"فاتورة رقم: {invoice_number}")
    receipt.append(f"التاريخ: {invoice_date}")
    if cashier:
        receipt.append(f"الكاشير: {cashier}")
    if customer:
        receipt.append(f"العميل: {customer}")
    if branch:
        receipt.append(f"الفرع: {branch}")
    
    receipt.append(dash)
    
    # Column Headers
    receipt.append(f"{'الصنف':<20} {'الكمية':>6} {'السعر':>8} {'المجموع':>10}")
    receipt.append(dash)
    
    # Items
    subtotal = 0
    tax_total = 0
    for line in lines:
        name = line.get("item_name", "---")[:20]
        qty = float(line.get("quantity", 0))
        price = float(line.get("unit_price", 0))
        line_total = float(line.get("line_total", qty * price))
        tax_rate = float(line.get("tax_rate", 0))
        
        subtotal += line_total
        tax_total += line_total * (tax_rate / 100)
        
        receipt.append(f"{name:<20} {qty:>6.0f} {price:>8.2f} {line_total:>10.2f}")
    
    receipt.append(dash)
    
    # Totals
    grand_total = subtotal + tax_total
    
    receipt.append(f"{'المجموع الفرعي:':<30} {subtotal:>16.2f}")
    if tax_total > 0:
        receipt.append(f"{'الضريبة:':<30} {tax_total:>16.2f}")
    receipt.append(sep)
    receipt.append(f"{'الإجمالي:':<30} {grand_total:>16.2f}")
    receipt.append(sep)
    
    # Payment info
    paid = float(header.get("paid_amount", grand_total))
    change = paid - grand_total
    payment_type = header.get("payment_type", "CASH")
    
    receipt.append(f"{'طريقة الدفع:':<30} {'نقدي' if payment_type == 'CASH' else 'شبكة'}")
    receipt.append(f"{'المبلغ المدفوع:':<30} {paid:>16.2f}")
    if change > 0:
        receipt.append(f"{'الباقي:':<30} {change:>16.2f}")
    
    receipt.append("")
    receipt.append(dash)
    
    # Custom Footer
    custom_footer = company.get("receipt_footer", "شكراً لزيارتكم\nThank you for your visit") if company else "شكراً لزيارتكم"
    for f_line in custom_footer.split('\n'):
        receipt.append(f_line.strip().center(width))
        
    receipt.append(dash)
    receipt.append(f"طُبع بواسطة SAS v1.0".center(width))
    receipt.append("")
    receipt.append("")  # Extra blank lines for paper cut
    receipt.append("")
    
    return "\n".join(receipt)


def format_stock_receipt(company, rows, width=48):
    """
    Generate plain-text stock inventory list for thermal printers.
    """
    sep = "=" * width
    dash = "-" * width
    
    receipt = []
    
    # Company Header
    custom_header = company.get("receipt_header") if company else None
    company_name = custom_header if custom_header else (company.get("name_ar", "SAS") if company else "SAS")
    
    for h_line in company_name.split('\n'):
        receipt.append(h_line.strip().center(width))
    
    receipt.append("جرد المخزون الحالي".center(width))
    receipt.append(f"التاريخ: {datetime.now().strftime('%Y-%m-%d %H:%M')}".center(width))
    receipt.append(sep)
    
    # Column Headers
    # Item Name (left), Qty (right)
    receipt.append(f"{'الصنف':<35} {'الكمية':>10}")
    receipt.append(dash)
    
    # Items
    total_qty = 0
    for row in rows:
        name = row.get("item_name", "---")[:35]
        qty = float(row.get("quantity", 0))
        total_qty += qty
        receipt.append(f"{name:<35} {qty:>10.0f}")
        # Add code on next line if it exists
        if row.get("item_code"):
            receipt.append(f"  [{row['item_code']}]")
    
    receipt.append(dash)
    receipt.append(f"{'إجمالي القطع:':<35} {total_qty:>10.0f}")
    receipt.append(sep)
    receipt.append("شكراً لاستخدامكم SAS".center(width))
    receipt.append("")
    receipt.append("")
    receipt.append("")
    
    return "\n".join(receipt)


def print_to_default_printer(text):
    """
    Print text directly to the Windows default printer without opening Notepad.
    Requires: pip install pywin32
    """
    try:
        import win32print
        import win32api

        # Get the default printer name
        printer_name = win32print.GetDefaultPrinter()
        
        # Open the printer
        hPrinter = win32print.OpenPrinter(printer_name)
        try:
            # Start a print job
            hJob = win32print.StartDocPrinter(hPrinter, 1, ("SAS Receipt", None, "RAW"))
            try:
                win32print.StartPagePrinter(hPrinter)
                
                # Most thermal printers need CP864 for Arabic.
                # If that fails, UTF-16 or UTF-8 might work depending on the driver.
                try:
                    # Try CP864 (Standard for many thermal printers)
                    raw_data = text.encode('cp864', errors='replace')
                except:
                    # Fallback to UTF-8
                    raw_data = text.encode('utf-8', errors='replace')
                
                win32print.WritePrinter(hPrinter, raw_data)
                win32print.EndPagePrinter(hPrinter)
            finally:
                win32print.EndDocPrinter(hPrinter)
        finally:
            win32print.ClosePrinter(hPrinter)
            
        return True
    except Exception as e:
        # Fallback to shell print if win32print fails
        print(f"Direct print error: {e}. Attempting shell print.")
        try:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
                f.write(text)
                temp_path = f.name
            
            # Print using the 'print' verb (less intrusive than /p)
            win32api.ShellExecute(0, "print", temp_path, None, ".", 0)
            return True
        except Exception as se:
            print(f"Fallback print error: {se}")
            return False


def print_receipt_raw_usb(text, vendor_id=None, product_id=None):
    """
    Print directly to USB thermal printer using python-escpos (if available).
    Requires: pip install python-escpos
    """
    try:
        from escpos.printer import Usb
        printer = Usb(vendor_id or 0x0416, product_id or 0x5011)
        
        # Set Arabic encoding
        printer.set(align='right')
        
        for line in text.split('\n'):
            printer.text(line + '\n')
        
        printer.cut()
        printer.close()
        return True
    except ImportError:
        print("python-escpos not installed. Using default printer instead.")
        return print_to_default_printer(text)
    except Exception as e:
        print(f"USB Print error: {e}. Falling back to default printer.")
        return print_to_default_printer(text)


def print_receipt_network(text, ip_address, port=9100):
    """
    Print to network thermal printer via TCP/IP.
    Most commercial thermal printers support port 9100.
    """
    import socket
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        sock.connect((ip_address, port))
        sock.sendall(text.encode('utf-8'))
        sock.close()
        return True
    except Exception as e:
        print(f"Network print error: {e}")
        return False


# ============================================================================
# Test
# ============================================================================
if __name__ == "__main__":
    # Test receipt generation
    company = {"name_ar": "مؤسسة SAS التجارية", "phone": "777123456", "address_ar": "صنعاء - اليمن"}
    header = {
        "invoice_number": "INV-0001",
        "invoice_date": "2026-05-05",
        "cashier_name": "أحمد",
        "customer_name": "عميل نقدي",
        "branch_name": "الفرع الرئيسي",
        "payment_type": "CASH",
        "paid_amount": 500,
    }
    lines = [
        {"item_name": "عصير برتقال", "quantity": 3, "unit_price": 7.5, "line_total": 22.5, "tax_rate": 0},
        {"item_name": "لاب توب أعمال", "quantity": 1, "unit_price": 150, "line_total": 150, "tax_rate": 0},
    ]
    
    receipt = format_receipt_text(company, header, lines)
    print(receipt)
    print("\n--- Receipt generated successfully ---")
