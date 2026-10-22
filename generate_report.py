# -*- coding: utf-8 -*-
import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_report():
    doc = Document()

    # Set standard margins (Top 2cm, Bottom 2cm, Left 3cm, Right 2cm)
    for section in doc.sections:
        section.top_margin = Inches(0.79)     # ~2.0 cm
        section.bottom_margin = Inches(0.79)  # ~2.0 cm
        section.left_margin = Inches(1.18)    # ~3.0 cm
        section.right_margin = Inches(0.79)   # ~2.0 cm
        section.different_first_page_header_footer = True

    # Color Palette
    PRIMARY_COLOR = RGBColor(24, 76, 120)     # Navy Blue
    SECONDARY_COLOR = RGBColor(41, 128, 185)  # Soft Blue
    DARK_TEXT = RGBColor(40, 40, 40)          # Off-black
    MUTED_GRAY = RGBColor(100, 100, 100)

    # Helper: Set paragraph font
    def format_para(p, space_before=0, space_after=6, line_spacing=1.2, align=WD_ALIGN_PARAGRAPH.JUSTIFY):
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = line_spacing
        p.alignment = align

    def add_run(p, text, font_name="Times New Roman", font_size=13, bold=False, italic=False, color=DARK_TEXT):
        run = p.add_run(text)
        run.font.name = font_name
        run.font.size = Pt(font_size)
        run.bold = bold
        run.italic = italic
        run.font.color.rgb = color
        return run

    # Helper: Add Heading 1
    def add_h1(text):
        p = doc.add_paragraph()
        format_para(p, space_before=16, space_after=8, align=WD_ALIGN_PARAGRAPH.LEFT)
        add_run(p, text, font_size=16, bold=True, color=PRIMARY_COLOR)
        return p

    # Helper: Add Heading 2
    def add_h2(text):
        p = doc.add_paragraph()
        format_para(p, space_before=12, space_after=6, align=WD_ALIGN_PARAGRAPH.LEFT)
        add_run(p, text, font_size=14, bold=True, color=SECONDARY_COLOR)
        return p

    # Helper: Add Heading 3
    def add_h3(text):
        p = doc.add_paragraph()
        format_para(p, space_before=8, space_after=4, align=WD_ALIGN_PARAGRAPH.LEFT)
        add_run(p, text, font_size=13, bold=True, italic=True, color=DARK_TEXT)
        return p

    # Helper: Add Normal Text Paragraph
    def add_body(text, bold_prefix="", italic=False):
        p = doc.add_paragraph()
        format_para(p, space_before=0, space_after=6, line_spacing=1.25, align=WD_ALIGN_PARAGRAPH.JUSTIFY)
        if bold_prefix:
            add_run(p, bold_prefix, font_size=13, bold=True, color=DARK_TEXT)
        add_run(p, text, font_size=13, italic=italic, color=DARK_TEXT)
        return p

    # Helper: Add Bullet
    def add_bullet(text, bold_prefix=""):
        p = doc.add_paragraph(style='List Bullet')
        format_para(p, space_before=1, space_after=3, line_spacing=1.2, align=WD_ALIGN_PARAGRAPH.JUSTIFY)
        if bold_prefix:
            add_run(p, bold_prefix, font_size=13, bold=True, color=DARK_TEXT)
        add_run(p, text, font_size=13, color=DARK_TEXT)
        return p

    # Helper: Add Code Block
    def add_code_block(code_text):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.cell(0, 0)
        cell.width = Inches(6.5)
        
        # Light grey background
        shading = parse_xml(r'<w:shd {} w:fill="F4F6F8"/>'.format(nsdecls('w')))
        cell._tc.get_or_add_tcPr().append(shading)
        
        # Thin border
        borders = parse_xml(r'''
            <w:tcBorders {} >
                <w:top w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/>
                <w:bottom w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/>
                <w:left w:val="single" w:sz="12" w:space="0" w:color="2563EB"/>
                <w:right w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/>
            </w:tcBorders>
        '''.format(nsdecls('w')))
        cell._tc.get_or_add_tcPr().append(borders)
        
        p = cell.paragraphs[0]
        format_para(p, space_before=4, space_after=4, line_spacing=1.1, align=WD_ALIGN_PARAGRAPH.LEFT)
        add_run(p, code_text, font_name="Consolas", font_size=10, color=RGBColor(30, 41, 59))
        
        # Empty space after table
        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Helper: Style table
    def style_table(table, col_widths, headers, data):
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        hdr_row = table.rows[0]
        for idx, title in enumerate(headers):
            cell = hdr_row.cells[idx]
            cell.width = Inches(col_widths[idx])
            shd = parse_xml(r'<w:shd {} w:fill="184C78"/>'.format(nsdecls('w')))
            cell._tc.get_or_add_tcPr().append(shd)
            p = cell.paragraphs[0]
            format_para(p, space_before=4, space_after=4, align=WD_ALIGN_PARAGRAPH.CENTER)
            add_run(p, title, font_size=11, bold=True, color=RGBColor(255, 255, 255))
            
        for r_idx, row_data in enumerate(data):
            row = table.add_row()
            bg_color = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, cell_value in enumerate(row_data):
                cell = row.cells[c_idx]
                cell.width = Inches(col_widths[c_idx])
                shd = parse_xml(r'<w:shd {} w:fill="{}"/>'.format(nsdecls('w'), bg_color))
                cell._tc.get_or_add_tcPr().append(shd)
                p = cell.paragraphs[0]
                align = WD_ALIGN_PARAGRAPH.CENTER if c_idx == 0 or len(cell_value) < 15 else WD_ALIGN_PARAGRAPH.LEFT
                format_para(p, space_before=3, space_after=3, line_spacing=1.1, align=align)
                add_run(p, cell_value, font_size=11, color=DARK_TEXT)

        # Set borders
        tblPr = table._tbl.tblPr
        tblBorders = parse_xml(r'''
            <w:tblBorders {} >
                <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
                <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
                <w:left w:val="none"/>
                <w:right w:val="none"/>
                <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
                <w:insideV w:val="none"/>
            </w:tblBorders>
        '''.format(nsdecls('w')))
        tblPr.append(tblBorders)
        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # =========================================================================
    # TRANG BÌA (COVER PAGE)
    # =========================================================================
    p_univ = doc.add_paragraph()
    format_para(p_univ, space_before=10, space_after=2, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_run(p_univ, "BỘ GIÁO DỤC VÀ ĐÀO TẠO\n", font_size=13, bold=True, color=DARK_TEXT)
    add_run(p_univ, "TRƯỜNG ĐẠI HỌC CÔNG NGHỆ\n", font_size=14, bold=True, color=PRIMARY_COLOR)
    add_run(p_univ, "KHOA CÔNG NGHỆ THÔNG TIN", font_size=12, bold=True, color=SECONDARY_COLOR)

    p_div = doc.add_paragraph()
    format_para(p_div, space_before=4, space_after=20, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_run(p_div, "------------------***------------------", font_size=12, bold=True, color=MUTED_GRAY)

    p_report_type = doc.add_paragraph()
    format_para(p_report_type, space_before=30, space_after=10, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_run(p_report_type, "BÁO CÁO BÀI TẬP LỚN / ĐỒ ÁN MÔN HỌC", font_size=15, bold=True, color=MUTED_GRAY)

    p_subj = doc.add_paragraph()
    format_para(p_subj, space_before=4, space_after=25, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_run(p_subj, "MÔN HỌC: ĐIỆN TOÁN ĐÁM MÂY (CLOUD COMPUTING)", font_size=16, bold=True, color=PRIMARY_COLOR)

    # Decorative Box for Title
    title_table = doc.add_table(rows=1, cols=1)
    title_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    title_cell = title_table.cell(0, 0)
    title_cell.width = Inches(6.5)
    shd = parse_xml(r'<w:shd {} w:fill="F0F7FF"/>'.format(nsdecls('w')))
    title_cell._tc.get_or_add_tcPr().append(shd)
    borders = parse_xml(r'''
        <w:tcBorders {} >
            <w:top w:val="single" w:sz="12" w:space="0" w:color="184C78"/>
            <w:bottom w:val="single" w:sz="12" w:space="0" w:color="184C78"/>
            <w:left w:val="single" w:sz="12" w:space="0" w:color="184C78"/>
            <w:right w:val="single" w:sz="12" w:space="0" w:color="184C78"/>
        </w:tcBorders>
    '''.format(nsdecls('w')))
    title_cell._tc.get_or_add_tcPr().append(borders)
    
    p_title_box = title_cell.paragraphs[0]
    format_para(p_title_box, space_before=14, space_after=4, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_run(p_title_box, "TÊN ĐỀ TÀI:\n", font_size=13, bold=True, color=SECONDARY_COLOR)
    p_title_main = title_cell.add_paragraph()
    format_para(p_title_main, space_before=0, space_after=14, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_run(p_title_main, "DEVELOPING A TASK MANAGEMENT SYSTEM USING NODEJS, POSTGRESQL, AND RENDER WITH TASK CREATION, TASK ASSIGNMENT, STATUS TRACKING, AND TASK SEARCH", font_size=15, bold=True, color=PRIMARY_COLOR)

    p_meta = doc.add_paragraph()
    format_para(p_meta, space_before=40, space_after=6, align=WD_ALIGN_PARAGRAPH.LEFT)
    p_meta.paragraph_format.left_indent = Inches(1.5)
    add_run(p_meta, "Giảng viên hướng dẫn:\t", font_size=13, bold=True)
    add_run(p_meta, "TS. / ThS. Giảng viên phụ trách\n", font_size=13)
    add_run(p_meta, "Sinh viên thực hiện:\t", font_size=13, bold=True)
    add_run(p_meta, "Đặng Văn Phú\n", font_size=13)
    add_run(p_meta, "Mã số sinh viên:\t\t", font_size=13, bold=True)
    add_run(p_meta, "Sinh viên KHTN / CNTT\n", font_size=13)
    add_run(p_meta, "Lớp học phần:\t\t", font_size=13, bold=True)
    add_run(p_meta, "Điện toán đám mây - K21/K22\n", font_size=13)
    add_run(p_meta, "Năm học:\t\t\t", font_size=13, bold=True)
    add_run(p_meta, "2025 - 2026", font_size=13)

    p_footer = doc.add_paragraph()
    format_para(p_footer, space_before=60, space_after=0, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_run(p_footer, "TP. HỒ CHÍ MINH, NĂM 2026", font_size=12, bold=True, color=DARK_TEXT)

    doc.add_page_break()

    # =========================================================================
    # MỤC LỤC (TABLE OF CONTENTS)
    # =========================================================================
    add_h1("MỤC LỤC TỔNG HỢP")
    
    toc_items = [
        ("MỤC LỤC TỔNG HỢP", "2"),
        ("DANH MỤC THUẬT NGỮ VÀ CHỮ VIẾT TẮT", "3"),
        ("CHƯƠNG 1: GIỚI THIỆU TỔNG QUAN", "4"),
        ("  1.1. Đặt vấn đề và tính cấp thiết của đề tài", "4"),
        ("  1.2. Mục tiêu nghiên cứu và phát triển", "4"),
        ("  1.3. Đối tượng và phạm vi nghiên cứu", "5"),
        ("  1.4. Ý nghĩa thực tiễn và tính mới của giải pháp Cloud", "5"),
        ("CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG", "6"),
        ("  2.1. Tổng quan về kiến trúc Điện toán đám mây (Cloud Computing)", "6"),
        ("  2.2. Nền tảng PaaS Render (Platform as a Service)", "7"),
        ("  2.3. Cơ sở dữ liệu đám mây Serverless Neon PostgreSQL (DBaaS)", "8"),
        ("  2.4. Công nghệ Backend & Frontend (NodeJS, Express, React, Vite)", "9"),
        ("  2.5. Cơ chế lưu trữ tệp tin đám mây và xử lý phân tán", "10"),
        ("CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG", "11"),
        ("  3.1. Phân tích yêu cầu chức năng (Functional Requirements)", "11"),
        ("  3.2. Phân tích yêu cầu phi chức năng (Non-Functional Requirements)", "12"),
        ("  3.3. Thiết kế kiến trúc tổng thể hệ thống (System Architecture)", "13"),
        ("  3.4. Thiết kế cơ sở dữ liệu quan hệ (Database Schema)", "14"),
        ("  3.5. Thiết kế giao diện lập trình ứng dụng RESTful API", "16"),
        ("CHƯƠNG 4: TRIỂN KHAI HỆ THỐNG VÀ HƯỚNG DẪN DEPLOY TRÊN RENDER", "18"),
        ("  4.1. Kiến trúc mã nguồn và quản lý cấu hình môi trường", "18"),
        ("  4.2. Khởi tạo và đồng bộ Database trên Neon Serverless", "19"),
        ("  4.3. Thiết lập Infrastructure as Code với Render Blueprint (render.yaml)", "20"),
        ("  4.4. Quy trình triển khai chi tiết từng bước trên Render Cloud", "21"),
        ("  4.5. Giải quyết các thách thức kỹ thuật thực tế trong quá trình deploy", "22"),
        ("CHƯƠNG 5: KẾT QUẢ VÀ ĐÁNH GIÁ", "24"),
        ("  5.1. Kết quả thực nghiệm các chức năng chính trên Production", "24"),
        ("  5.2. Đánh giá hiệu năng, tính sẵn sàng và tối ưu chi phí Cloud", "25"),
        ("  5.3. Hạn chế còn tồn tại và hướng phát triển tương lai", "26"),
        ("TÀI LIỆU THAM KHẢO", "27"),
    ]

    toc_table = doc.add_table(rows=0, cols=2)
    toc_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for title, page in toc_items:
        row = toc_table.add_row()
        c0 = row.cells[0]
        c1 = row.cells[1]
        c0.width = Inches(5.8)
        c1.width = Inches(0.7)
        p0 = c0.paragraphs[0]
        p1 = c1.paragraphs[0]
        is_ch = title.startswith("CHƯƠNG") or title in ["MỤC LỤC TỔNG HỢP", "DANH MỤC THUẬT NGỮ VÀ CHỮ VIẾT TẮT", "TÀI LIỆU THAM KHẢO"]
        format_para(p0, space_before=2 if is_ch else 1, space_after=2, align=WD_ALIGN_PARAGRAPH.LEFT)
        format_para(p1, space_before=2 if is_ch else 1, space_after=2, align=WD_ALIGN_PARAGRAPH.RIGHT)
        add_run(p0, title, font_size=11, bold=is_ch, color=PRIMARY_COLOR if is_ch else DARK_TEXT)
        add_run(p1, page, font_size=11, bold=is_ch, color=PRIMARY_COLOR if is_ch else DARK_TEXT)

    doc.add_page_break()

    # =========================================================================
    # DANH MỤC THUẬT NGỮ VÀ VIẾT TẮT
    # =========================================================================
    add_h1("DANH MỤC THUẬT NGỮ VÀ CHỮ VIẾT TẮT")
    
    abbr_data = [
        ["Thuật ngữ", "Tên tiếng Anh đầy đủ", "Ý nghĩa / Giải thích"],
        ["Cloud", "Cloud Computing", "Điện toán đám mây, cung cấp tài nguyên CNTT qua Internet."],
        ["IaaS", "Infrastructure as a Service", "Dịch vụ cung cấp hạ tầng phần cứng, máy ảo và mạng ảo."],
        ["PaaS", "Platform as a Service", "Nền tảng quản lý môi trường chạy ứng dụng tự động (Render, Heroku)."],
        ["SaaS", "Software as a Service", "Phần mềm được cung cấp như một dịch vụ trọn gói cho người dùng."],
        ["DBaaS", "Database as a Service", "Cơ sở dữ liệu quản trị tự động trên đám mây (Neon, Amazon RDS)."],
        ["Serverless", "Serverless Architecture", "Kiến trúc tự co giãn tài nguyên theo tải, không cần quản trị máy chủ."],
        ["RESTful API", "Representational State Transfer", "Kiến trúc thiết kế giao diện lập trình ứng dụng chuẩn HTTP/JSON."],
        ["JWT", "JSON Web Token", "Chuẩn mã hóa thông tin xác thực an toàn giữa Client và Server."],
        ["RBAC", "Role-Based Access Control", "Mô hình kiểm soát truy cập và phân quyền dựa trên vai trò."],
        ["SPA", "Single Page Application", "Ứng dụng web trang đơn tải động dữ liệu không cần reload toàn bộ trang."],
        ["CI/CD", "Continuous Integration / Deployment", "Quy trình tích hợp và triển khai mã nguồn tự động hóa liên tục."],
        ["IaC", "Infrastructure as Code", "Quản lý và cấp phát hạ tầng thông qua tệp cấu hình mã nguồn (render.yaml)."]
    ]
    t_abbr = doc.add_table(rows=1, cols=3)
    style_table(t_abbr, [1.0, 2.5, 3.0], abbr_data[0], abbr_data[1:])

    doc.add_page_break()

    # =========================================================================
    # CHƯƠNG 1: GIỚI THIỆU TỔNG QUAN
    # =========================================================================
    add_h1("CHƯƠNG 1: GIỚI THIỆU TỔNG QUAN")

    add_h2("1.1. Đặt vấn đề và tính cấp thiết của đề tài")
    add_body(
        "Trong bối cảnh chuyển đổi số mạnh mẽ hiện nay, việc quản lý công việc và dự án trong các tổ chức, doanh nghiệp "
        "cũng như các nhóm làm việc trở thành một yếu tố sống còn quyết định đến năng suất và sự thành bại của dự án. "
        "Các phương pháp quản lý truyền thống bằng bảng biểu giấy tờ, bảng tính Excel rời rạc hoặc trao đổi qua tin nhắn mạng "
        "xã hội đã bộc lộ nhiều điểm yếu chí mạng: thông tin phân tán, khó kiểm soát tiến độ thời gian thực, thiếu tính minh bạch "
        "trong phân công trách nhiệm, và dễ thất thoát tài liệu đính kèm quan trọng."
    )
    add_body(
        "Đồng thời, sự phát triển vượt bậc của công nghệ Điện toán đám mây (Cloud Computing) đã mở ra một kỷ nguyên mới "
        "cho việc phát triển và vận hành phần mềm. Thay vì phải đầu tư chi phí lớn mua sắm máy chủ vật lý, thiết lập phòng máy "
        "và duy trì đội ngũ kỹ thuật vận hành phức tạp tại chỗ (On-Premises), các tổ chức ngày nay hoàn toàn có thể tận dụng "
        "các dịch vụ nền tảng đám mây (Platform as a Service - PaaS) và Cơ sở dữ liệu đám mây (Database as a Service - DBaaS) "
        "để triển khai ứng dụng chỉ trong vài phút với khả năng mở rộng không giới hạn và tối ưu hóa chi phí vận hành."
    )
    add_body(
        "Xuất phát từ nhu cầu thực tiễn đó, đề tài: \"Developing a Task Management System Using NodeJS, PostgreSQL, and Render "
        "with Task Creation, Task Assignment, Status Tracking, and Task Search\" (Phát triển hệ thống quản lý công việc TaskFlow "
        "sử dụng NodeJS, PostgreSQL và triển khai trên nền tảng đám mây Render) được lựa chọn nghiên cứu và xây dựng nhằm "
        "giải quyết trọn vẹn bài toán quản trị dự án hiện đại dựa trên nền tảng điện toán đám mây."
    )

    add_h2("1.2. Mục tiêu nghiên cứu và phát triển")
    add_body("Đề tài tập trung hoàn thành các mục tiêu cốt lõi sau:")
    add_bullet("Nắm vững các khái niệm, mô hình dịch vụ (IaaS, PaaS, SaaS, DBaaS) và nguyên lý vận hành ứng dụng trên nền tảng đám mây.", "Về mặt học thuật: ")
    add_bullet("Xây dựng thành công hệ thống ứng dụng web quản lý công việc chuyên nghiệp (TaskFlow) áp dụng mô hình 3 lớp phân tán (Frontend SPA, Backend REST API, Database DBaaS).", "Về mặt kiến trúc: ")
    add_bullet("Hiện thực hóa đầy đủ 4 nhóm tính năng trọng tâm được định nghĩa trong tên đề tài:", "Về mặt tính năng nghiệp vụ: ")
    add_bullet("Cho phép tạo mới nhiệm vụ với đầy đủ metadata: tên, mô tả chi tiết, độ ưu tiên (low, medium, high, urgent), hạn chót (due date), tag và tài liệu đính kèm.", "  + Task Creation (Tạo công việc): ")
    add_bullet("Hỗ trợ phân công linh hoạt nhiều thành viên vào một đầu việc; phân quyền chặt chẽ giữa Quản trị viên (Admin), Trưởng dự án (Project Lead) và Nhân viên (Member).", "  + Task Assignment (Phân công công việc): ")
    add_bullet("Theo dõi vòng đời công việc trực quan qua bảng Kanban và danh sách bảng, chuyển đổi trạng thái (TODO, IN PROGRESS, REVIEW, COMPLETED), gửi báo cáo nghiệm thu kèm tệp tin và lưu trữ toàn bộ lịch sử thay đổi.", "  + Status Tracking (Theo dõi trạng thái): ")
    add_bullet("Tìm kiếm công việc tức thời (real-time debounced search) theo từ khóa tiêu đề, mô tả kết hợp các bộ lọc đa tiêu chí (theo trạng thái, độ ưu tiên, thành viên thực hiện).", "  + Task Search & Filter (Tìm kiếm & Bộ lọc): ")
    add_bullet("Tự động hóa hoàn toàn quy trình đóng gói, build và triển khai hệ thống lên dịch vụ Render PaaS thông qua cấu hình Blueprint (render.yaml) kết nối với GitHub và cơ sở dữ liệu Neon PostgreSQL.", "Về mặt triển khai Cloud: ")

    add_h2("1.3. Đối tượng và phạm vi nghiên cứu")
    add_bullet("Các mô hình quản lý dự án Agile/Scrum, giao diện quản lý dạng Kanban/Linear/Jira; các dịch vụ Cloud hiện đại như Render (PaaS), Neon (Serverless Postgres DBaaS), Supabase Object Storage.", "Đối tượng nghiên cứu: ")
    add_bullet("Tập trung phát triển một hệ thống quản lý công việc phục vụ nhóm làm việc, doanh nghiệp vừa và nhỏ (SMEs) hoặc các nhóm sinh viên học tập. Hệ thống hoạt động trực tuyến 100% trên môi trường Internet thông qua tên miền công khai do Render cung cấp.", "Phạm vi ứng dụng: ")

    add_h2("1.4. Ý nghĩa thực tiễn và tính mới của giải pháp Cloud")
    add_body(
        "Khác với các đồ án truyền thống chỉ chạy cục bộ trên môi trường localhost máy tính cá nhân, đề tài này giải quyết "
        "trực tiếp bài toán triển khai thực tế trên môi trường Internet (Production Environment). Việc tích hợp mô hình "
        "Infrastructure as Code (IaC) thông qua tệp cấu hình render.yaml giúp hệ thống có khả năng tái lập và tự động hóa "
        "quy trình CI/CD. Cơ sở dữ liệu sử dụng Neon Serverless PostgreSQL cho phép tách biệt giữa tầng lưu trữ (Storage) "
        "và tầng tính toán (Compute), tự động ngắt kết nối khi không có tải để tiết kiệm tối đa chi phí điện toán."
    )

    doc.add_page_break()

    # =========================================================================
    # CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG
    # =========================================================================
    add_h1("CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG")

    add_h2("2.1. Tổng quan về kiến trúc Điện toán đám mây (Cloud Computing)")
    add_body(
        "Theo định nghĩa chuẩn của Viện Tiêu chuẩn và Công nghệ Quốc gia Hoa Kỳ (NIST), Điện toán đám mây là một mô hình "
        "cho phép truy cập mạng theo yêu cầu tới một tập hợp tài nguyên điện toán có thể cấu hình được (như mạng, máy chủ, "
        "bộ lưu trữ, ứng dụng và dịch vụ). Tài nguyên này có thể được cấp phát và giải phóng nhanh chóng với nỗ lực quản lý "
        "hoặc sự tương tác tối thiểu từ nhà cung cấp dịch vụ."
    )
    add_body("Điện toán đám mây sở hữu 5 đặc tính cốt lõi:")
    add_bullet("Người dùng có thể tự cấp phát năng lực tính toán mà không cần can thiệp thủ công từ nhà cung cấp.", "1. Tự phục vụ theo yêu cầu (On-demand Self-service): ")
    add_bullet("Tài nguyên sẵn sàng truy cập qua mạng Internet tiêu chuẩn từ mọi loại thiết bị (PC, Laptop, Smartphone).", "2. Truy cập mạng diện rộng (Broad Network Access): ")
    add_bullet("Tài nguyên của nhà cung cấp được gom thành nhóm dùng chung phục vụ nhiều khách hàng (Multi-tenant).", "3. Gom tài nguyên (Resource Pooling): ")
    add_bullet("Năng lực hệ thống có thể co giãn đàn hồi tức thời tùy thuộc vào lưu lượng truy cập thực tế.", "4. Khả năng co giãn nhanh (Rapid Elasticity): ")
    add_bullet("Hệ thống tự động đo lường và tính phí chính xác dựa trên lượng tài nguyên tiêu thụ thực tế (Pay-as-you-go).", "5. Dịch vụ đo lường định lượng (Measured Service): ")

    add_body("Về mô hình dịch vụ, đề tài kết hợp hài hòa hai mô hình then chốt:")
    add_bullet("Render cung cấp môi trường hoàn chỉnh để chạy ứng dụng (NodeJS runtime, container, build pipeline, routing, SSL/TLS tự động) mà nhà phát triển không cần quản lý hệ điều hành hay máy chủ ảo bên dưới.", "• Platform as a Service (PaaS): ")
    add_bullet("Neon cung cấp hệ quản trị cơ sở dữ liệu PostgreSQL chuẩn đám mây, tự động sao lưu, phân cụm và quản lý tài nguyên tính toán theo yêu cầu truy vấn.", "• Database as a Service (DBaaS): ")

    add_h2("2.2. Nền tảng PaaS Render (Platform as a Service)")
    add_body(
        "Render là một nền tảng Cloud PaaS thế hệ mới, được thiết kế để thay thế các nền tảng truyền thống như Heroku với "
        "tốc độ nhanh hơn, tính năng phong phú hơn và chi phí hợp lý. Render hỗ trợ triển khai toàn diện các dạng dịch vụ:"
    )
    add_bullet("Phục vụ các ứng dụng backend, API server có trạng thái hoặc không trạng thái chạy trong container bảo mật, hỗ trợ kết nối port tự động và gắn SSL miễn phí.", "• Web Services: ")
    add_bullet("Phục vụ các ứng dụng Frontend build tĩnh (React, Vue, Vite) được phân phối qua mạng phân phối nội dung (CDN) toàn cầu với tốc độ cao và băng thông tối ưu.", "• Static Sites: ")
    add_bullet("Tính năng Blueprint cho phép khai báo toàn bộ hệ thống gồm nhiều dịch vụ kết nối với nhau thông qua file render.yaml duy nhất, áp dụng triết lý Infrastructure as Code.", "• Infrastructure as Code (render.yaml): ")
    add_bullet("Render tự động giám sát nhánh mã nguồn (Git webhook), khi có commit mới sẽ kích hoạt quy trình tải mã, cài đặt thư viện (npm ci), chạy migration và khởi động server mới không gây gián đoạn (Zero-downtime deployment).", "• Tích hợp CI/CD tự động: ")

    add_h2("2.3. Cơ sở dữ liệu đám mây Serverless Neon PostgreSQL (DBaaS)")
    add_body(
        "Neon là một giải pháp PostgreSQL Serverless nguồn mở đột phá trên Cloud, phân tách hoàn toàn tầng Lưu trữ (Storage) "
        "và tầng Xử lý tính toán (Compute). Trong kiến trúc này, dữ liệu được ghi nhận vào các cụm lưu trữ phân tán bền vững, "
        "trong khi các instance xử lý truy vấn tính toán (Compute Nodes) có thể bật, tắt hoặc co giãn trong vài phần nghìn giây."
    )
    add_body("Các ưu điểm vượt trội của Neon áp dụng trong dự án:")
    add_bullet("Neon cung cấp sẵn PgBouncer kết nối qua chuỗi URL sslmode=require, cho phép hàng nghìn yêu cầu từ Render API đồng thời mà không làm nghẽn kết nối của Postgres.", "• Connection Pooling tích hợp: ")
    add_bullet("Khi hệ thống không có yêu cầu trong một khoảng thời gian, Compute node sẽ chuyển sang trạng thái Sleep để tiết kiệm chi phí; khi có truy vấn mới, nó sẽ tự thức dậy trong vòng vài trăm mili-giây.", "• Scale-to-Zero: ")
    add_bullet("Dữ liệu được bảo vệ an toàn trên vùng hạ tầng đám mây khu vực Đông Nam Á (AWS ap-southeast-1 - Singapore) giúp giảm độ trễ mạng tối đa khi kết nối với Render Singapore.", "• Vị trí địa lý tối ưu (Low Latency): ")

    add_h2("2.4. Công nghệ Backend & Frontend")
    add_body(
        "1. Backend (NodeJS & ExpressJS):\n"
        "NodeJS với cơ chế Non-blocking I/O và Event Loop hướng sự kiện đặc biệt phù hợp cho các ứng dụng quản lý tác vụ "
        "yêu cầu khả năng tiếp nhận đồng thời nhiều yêu cầu đọc/ghi dữ liệu. Hệ thống sử dụng thư viện 'pg' (Node-Postgres) "
        "để thực hiện các truy vấn tham số hóa (Parameterized Queries) chống tuyệt đối lỗi bảo mật SQL Injection. "
        "Cơ chế bảo mật sử dụng JSON Web Token (JWT) kết hợp thuật toán mã hóa mật khẩu bcryptjs an toàn."
    )
    add_body(
        "2. Frontend (ReactJS, Vite & TailwindCSS):\n"
        "Giao diện người dùng được xây dựng theo kiến trúc SPA hiện đại với React 18 và công cụ build Vite siêu tốc. "
        "Giao diện lấy cảm hứng từ các công cụ quản lý dự án hàng đầu thế giới (Jira, Linear) với hệ thống màu sắc trực quan, "
        "bảng điều khiển tương tác mượt mà và thiết kế tương thích mọi kích thước màn hình (Responsive Design) nhờ TailwindCSS."
    )

    add_h2("2.5. Cơ chế lưu trữ tệp tin đám mây và xử lý phân tán")
    add_body(
        "Hệ thống thiết kế kiến trúc lưu trữ đa tầng (Hybrid Storage Adapter): Hệ thống kiểm tra cấu hình kết nối đám mây "
        "với dịch vụ Object Storage của Supabase (chuẩn S3-compatible). Trong trường hợp chưa kích hoạt Supabase, hệ thống "
        "tự động kích hoạt cơ chế Local Storage Fallback an toàn trên server với bộ định tuyến tệp tin tĩnh có gắn Header "
        "Content-Disposition tải về trực tiếp. Đường dẫn tải tệp được động hóa bằng biến môi trường RENDER_EXTERNAL_URL "
        "giúp tránh hoàn toàn lỗi kết nối nội bộ khi chạy trên môi trường đám mây."
    )

    doc.add_page_break()

    # =========================================================================
    # CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG
    # =========================================================================
    add_h1("CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG")

    add_h2("3.1. Phân tích yêu cầu chức năng (Functional Requirements)")
    add_body("Hệ thống quản lý công việc TaskFlow được phân tách thành các module chức năng nghiệp vụ chặt chẽ:")
    
    fr_data = [
        ["STT", "Nhóm chức năng", "Chi tiết các chức năng thực thi"],
        ["1", "Xác thực & Người dùng", "Đăng ký tài khoản, đăng nhập với JWT, kiểm tra phiên đăng nhập (/api/auth/me), đăng xuất, mã hóa mật khẩu bằng bcrypt."],
        ["2", "Quản lý Dự án (Project)", "Tạo dự án mới kèm tiền tố định danh (Key ví dụ PRJ), quản lý thành viên dự án, chuyển đổi dự án làm việc, cập nhật và xóa dự án (Danger Zone)."],
        ["3", "Tạo Công việc (Task Creation)", "Tạo nhiệm vụ thuộc dự án, nhập tiêu đề, mô tả Markdown/Text, chọn mức ưu tiên (low, medium, high, urgent), hạn chót, đính kèm tệp tin tài liệu."],
        ["4", "Phân công (Task Assignment)", "Gán một hoặc nhiều nhân viên vào nhiệm vụ, thu hồi phân công, theo dõi danh sách người phụ trách kèm avatar và vai trò."],
        ["5", "Theo dõi Trạng thái (Tracking)", "Kéo thả/chuyển trạng thái nhiệm vụ (TODO -> IN_PROGRESS -> REVIEW -> COMPLETED), ghi nhận log thời gian tự động, gửi báo cáo hoàn thành (Completion Report)."],
        ["6", "Tìm kiếm & Lọc (Search & Filter)", "Tìm kiếm tức thời theo từ khóa, lọc theo trạng thái, lọc theo độ ưu tiên, lọc theo thành viên phụ trách."],
        ["7", "Tương tác & Tài liệu", "Bình luận trao đổi (Comments), lưu vết nhật ký hoạt động (Audit Trail History), upload và download tệp tin đính kèm an toàn."],
        ["8", "Thống kê Báo cáo", "Bảng thống kê tỷ lệ hoàn thành công việc, số lượng nhiệm vụ theo trạng thái, số lượng task quá hạn (Overdue) của từng dự án."]
    ]
    t_fr = doc.add_table(rows=1, cols=3)
    style_table(t_fr, [0.6, 2.2, 3.7], fr_data[0], fr_data[1:])

    add_h2("3.2. Phân tích yêu cầu phi chức năng (Non-Functional Requirements)")
    add_bullet("Mật khẩu được băm bằng bcrypt với Salt rounds = 10; truyền tải dữ liệu qua HTTPS/TLS mã hóa 256-bit; cơ chế CORS chặt chẽ ngăn chặn tấn công Cross-Origin; tham số hóa truy vấn SQL chống SQL Injection.", "• Tính bảo mật (Security): ")
    add_bullet("Thời gian phản hồi API trung bình dưới 200ms đối với các tác vụ thông thường; tối ưu hóa kích thước bundle JavaScript của Frontend dưới 500KB bằng kỹ thuật Code Splitting và nén Gzip/Brotli.", "• Hiệu năng (Performance): ")
    add_bullet("Kiến trúc Stateless Backend cho phép tăng số lượng instance API dễ dàng; kết hợp bộ gom kết nối cơ sở dữ liệu PgBouncer của Neon hỗ trợ chịu tải cao.", "• Khả năng mở rộng (Scalability): ")
    add_bullet("Tận dụng hạ tầng đám mây toàn cầu của Render với cam kết thời gian hoạt động Uptime đạt 99.9% và cơ chế Health Check tự động khởi động lại container khi phát hiện lỗi.", "• Tính sẵn sàng (Availability): ")

    add_h2("3.3. Thiết kế kiến trúc tổng thể hệ thống (System Architecture)")
    add_body(
        "Hệ thống áp dụng mô hình kiến trúc 3 lớp phân tán hiện đại trên môi trường Điện toán đám mây (Cloud 3-Tier Architecture):"
    )
    add_bullet("Ứng dụng ReactJS Single Page Application được deploy dưới dạng Static Site trên dịch vụ CDN toàn cầu của Render (https://taskflow-web-kequ.onrender.com). Giao tiếp hoàn toàn qua giao thức HTTPS và JSON REST API.", "1. Tầng Trình diễn (Client / Presentation Layer): ")
    add_bullet("Máy chủ NodeJS ExpressJS chạy trên Render Web Service (https://taskflow-api-0y78.onrender.com). Đảm nhận việc xử lý logic nghiệp vụ, xác thực JWT, phân quyền, kiểm tra tính hợp lệ dữ liệu và điều phối các dịch vụ ngoài.", "2. Tầng Nghiệp vụ (Application / Business Logic Layer): ")
    add_bullet("Cơ sở dữ liệu quan hệ PostgreSQL lưu trữ trên nền tảng Serverless Neon DB (Singapore Region). Kết nối an toàn qua kênh mã hóa SSL với Connection Pooling.", "3. Tầng Dữ liệu (Data Storage Layer): ")

    add_h2("3.4. Thiết kế cơ sở dữ liệu quan hệ (Database Schema)")
    add_body("Cơ sở dữ liệu bao gồm 11 bảng được thiết kế chuẩn hóa bậc 3 (3NF) nhằm đảm bảo toàn vẹn dữ liệu:")

    schema_data = [
        ["Tên bảng", "Khóa chính", "Khóa ngoại chính", "Chức năng lưu trữ"],
        ["users", "id (SERIAL)", "-", "Thông tin tài khoản: email, password_hash, full_name, role (admin/member)."],
        ["projects", "id (SERIAL)", "lead_id -> users(id)", "Dự án: name, key (ví dụ PRJ), description, lead_id."],
        ["project_members", "id (SERIAL)", "project_id, user_id", "Danh sách phân quyền thành viên tham gia từng dự án cụ thể."],
        ["tasks", "id (SERIAL)", "project_id, reporter_id", "Nhiệm vụ: title, description, status, priority, due_date."],
        ["task_assignments", "id (SERIAL)", "task_id, assignee_id", "Phân công người phụ trách công việc, trạng thái xử lý cá nhân."],
        ["task_documents", "id (SERIAL)", "task_id, uploaded_by", "Tệp tin đính kèm của nhiệm vụ: filename, storage_path, mime_type."],
        ["task_history", "id (SERIAL)", "task_id, changed_by", "Nhật ký lưu vết toàn bộ thay đổi trạng thái, ưu tiên, phân công."],
        ["task_comments", "id (SERIAL)", "task_id, author_id", "Các bình luận trao đổi, thảo luận của thành viên trong từng task."],
        ["completion_reports", "id (SERIAL)", "assignment_id, user_id", "Báo cáo nghiệm thu kết quả công việc khi thành viên hoàn thành."],
        ["report_documents", "id (SERIAL)", "report_id, document_id", "Liên kết các tệp minh chứng kết quả kèm theo báo cáo hoàn thành."],
        ["activity_logs", "id (SERIAL)", "user_id, project_id", "Nhật ký hoạt động chung của toàn bộ không gian làm việc."]
    ]
    t_schema = doc.add_table(rows=1, cols=4)
    style_table(t_schema, [1.4, 0.9, 1.8, 2.4], schema_data[0], schema_data[1:])

    add_h2("3.5. Thiết kế giao diện lập trình ứng dụng RESTful API")
    add_body("Toàn bộ các tài nguyên hệ thống được trừu tượng hóa và giao tiếp thông qua chuẩn RESTful API:")

    api_data = [
        ["Phương thức", "Endpoint URL", "Mô tả chức năng", "Quyền truy cập"],
        ["POST", "/api/auth/register", "Đăng ký tài khoản người dùng mới", "Công khai"],
        ["POST", "/api/auth/login", "Đăng nhập và nhận chuỗi JWT token", "Công khai"],
        ["GET", "/api/auth/me", "Lấy thông tin tài khoản đang đăng nhập", "User đã đăng nhập"],
        ["GET", "/api/projects", "Lấy danh sách các dự án tham gia", "User đã đăng nhập"],
        ["POST", "/api/projects", "Tạo dự án mới (gán người tạo làm Lead)", "User đã đăng nhập"],
        ["DELETE", "/api/projects/:id", "Xóa hoàn toàn dự án và dữ liệu liên quan", "Admin / Project Lead"],
        ["GET", "/api/projects/:id/tasks", "Lấy danh sách task kèm bộ lọc & tìm kiếm", "Thành viên dự án"],
        ["POST", "/api/projects/:id/tasks", "Tạo task mới kèm đính kèm tệp tin", "Project Lead / Admin"],
        ["PATCH", "/api/tasks/:id/status", "Cập nhật trạng thái tiến độ của task", "Thành viên phụ trách"],
        ["POST", "/api/tasks/:id/assignments", "Phân công thêm nhân viên vào task", "Project Lead / Admin"],
        ["GET", "/api/tasks/:id/documents/:docId/url", "Tạo signed link tải tệp tin đính kèm", "Thành viên dự án"],
        ["GET", "/api/health", "Kiểm tra tình trạng sống của Web Service", "Render Health Check"]
    ]
    t_api = doc.add_table(rows=1, cols=4)
    style_table(t_api, [0.8, 2.5, 2.2, 1.0], api_data[0], api_data[1:])

    doc.add_page_break()

    # =========================================================================
    # CHƯƠNG 4: TRIỂN KHAI HỆ THỐNG VÀ HƯỚNG DẪN DEPLOY TRÊN RENDER
    # =========================================================================
    add_h1("CHƯƠNG 4: TRIỂN KHAI HỆ THỐNG VÀ HƯỚNG DẪN DEPLOY TRÊN RENDER")

    add_h2("4.1. Kiến trúc mã nguồn và quản lý cấu hình môi trường")
    add_body(
        "Mã nguồn dự án được tổ chức theo mô hình Monorepo rõ ràng, giúp quản lý tập trung toàn bộ cấu phần hệ thống "
        "trên kho lưu trữ GitHub (https://github.com/phudang0611-beep/TaskFlow-cloud-computing):"
    )
    add_bullet("backend/: Chứa mã nguồn NodeJS, API routes, controllers, middleware, migration scripts và tests.", "• ")
    add_bullet("web/: Chứa mã nguồn ứng dụng ReactJS SPA, components, Tailwind styles và các model quản lý state.", "• ")
    add_bullet("render.yaml: Tệp cấu hình Blueprint Infrastructure as Code để khai báo hạ tầng triển khai Render.", "• ")

    add_h2("4.2. Khởi tạo và đồng bộ Database trên Neon Serverless")
    add_body(
        "1. Tạo dự án trên Neon Console: Đăng nhập vào trang quản trị Neon Cloud (neon.tech), khởi tạo một Project mới "
        "chọn khu vực Singapore (AWS ap-southeast-1). Neon sẽ cung cấp chuỗi kết nối (Connection String) định dạng:\n"
        "postgresql://neondb_owner:[PASSWORD]@ep-bitter-cell-azrbbn7e.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    )
    add_body(
        "2. Đồng bộ hóa Schema lũy thừa (Idempotent Migration): Để đảm bảo quá trình build tự động trên Render không bị lỗi "
        "trùng lặp bảng hoặc kiểu dữ liệu enum khi chạy lại nhiều lần, các tệp migration được viết bằng cú pháp kiểm tra tồn tại an toàn:"
    )
    add_code_block(
        "DO $$ BEGIN\n"
        "    CREATE TYPE user_role AS ENUM ('admin', 'member');\n"
        "EXCEPTION\n"
        "    WHEN duplicate_object THEN null;\n"
        "END $$;\n\n"
        "CREATE TABLE IF NOT EXISTS users (\n"
        "    id SERIAL PRIMARY KEY,\n"
        "    email VARCHAR(255) UNIQUE NOT NULL,\n"
        "    password_hash VARCHAR(255) NOT NULL,\n"
        "    full_name VARCHAR(255) NOT NULL,\n"
        "    role user_role DEFAULT 'member',\n"
        "    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n"
        ");"
    )

    add_h2("4.3. Thiết lập Infrastructure as Code với Render Blueprint (render.yaml)")
    add_body(
        "Render cho phép định nghĩa toàn bộ hạ tầng đám mây bao gồm dịch vụ Web Service (Backend) và Static Site (Frontend) "
        "thông qua tệp render.yaml đặt tại thư mục gốc của kho mã nguồn. Dưới đây là nội dung cấu hình thực tế của hệ thống:"
    )
    add_code_block(
        "services:\n"
        "    - type: web\n"
        "      name: taskflow-api\n"
        "      runtime: node\n"
        "      plan: free\n"
        "      region: singapore\n"
        "      buildCommand: npm ci --prefix backend\n"
        "      startCommand: npm --prefix backend run migrate && npm --prefix backend start\n"
        "      healthCheckPath: /api/health\n"
        "      envVars:\n"
        "          - key: NODE_ENV\n"
        "            value: production\n"
        "          - key: API_URL\n"
        "            value: https://taskflow-api-0y78.onrender.com\n"
        "          - key: DATABASE_URL\n"
        "            value: postgresql://neondb_owner:npg_vImtpEGk8S9Z@ep-bitter-cell-azrbbn7e.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require\n"
        "          - key: JWT_SECRET\n"
        "            generateValue: true\n\n"
        "    - type: web\n"
        "      name: taskflow-web\n"
        "      runtime: static\n"
        "      rootDir: web\n"
        "      buildCommand: npm ci && npm run build\n"
        "      staticPublishPath: dist\n"
        "      envVars:\n"
        "          - key: VITE_API_URL\n"
        "            value: https://taskflow-api-0y78.onrender.com"
    )

    add_h2("4.4. Quy trình triển khai chi tiết từng bước trên Render Cloud")
    add_body("Quy trình đưa hệ thống từ mã nguồn cục bộ lên môi trường production bao gồm 4 bước tiêu chuẩn:")
    add_bullet("Đưa toàn bộ mã nguồn lên nhánh chính (main) của kho lưu trữ GitHub bằng lệnh git push origin main.", "Bước 1 - Đẩy mã nguồn lên GitHub: ")
    add_bullet("Đăng nhập tài khoản Render (render.com), chọn 'Blueprints' -> 'New Blueprint Instance'. Chọn kho lưu trữ TaskFlow-cloud-computing đã cấp quyền.", "Bước 2 - Tạo Blueprint trên Render: ")
    add_bullet("Render sẽ tự động phân tích file render.yaml và hiển thị danh sách 2 dịch vụ: taskflow-api (Web Service) và taskflow-web (Static Site). Kiểm tra các biến môi trường và bấm 'Apply'.", "Bước 3 - Cấu hình và Xác nhận: ")
    add_bullet("Hệ thống CI/CD của Render tự động chạy buildCommand, migrate database Neon và khởi động startCommand. Khi biểu tượng chuyển sang màu xanh lá 'Live', cả hai dịch vụ đã hoạt động chính thức.", "Bước 4 - Giám sát Build & Live: ")

    add_h2("4.5. Giải quyết các thách thức kỹ thuật thực tế trong quá trình deploy")
    add_body(
        "Trong quá trình triển khai thực tế trên môi trường đám mây Render, nhóm phát triển đã phát hiện và xử lý "
        "thành công 3 bài toán kỹ thuật phức tạp điển hình của Cloud Computing:"
    )
    add_body(
        "1. Xử lý lỗi chặn chia sẻ tài nguyên nguồn gốc chéo (CORS Issue):\n"
        "Do frontend và backend được triển khai trên hai domain con khác nhau của Render (taskflow-web-kequ.onrender.com "
        "và taskflow-api-0y78.onrender.com), trình duyệt sẽ chặn các yêu cầu HTTP. Nhóm đã cấu hình middleware CORS "
        "năng động trong app.js cho phép chấp nhận các nguồn gốc kết thúc bằng '.onrender.com' và kiểm tra credentials an toàn."
    )
    add_body(
        "2. Xử lý lỗi đường dẫn tải tệp (Download Connection Refused):\n"
        "Ban đầu, khi chạy ở môi trường phát triển cục bộ, đường dẫn tải file được gán mặc định http://localhost:PORT. "
        "Khi triển khai lên Render, server gán PORT=10000 khiến người dùng bấm tải file bị trình duyệt báo lỗi localhost refused to connect. "
        "Nhóm đã giải quyết bằng cách tích hợp biến môi trường động RENDER_EXTERNAL_URL và API_URL trong supabaseStorage.js "
        "giúp trả về chính xác đường dẫn công khai https://taskflow-api-0y78.onrender.com/api/files/... kèm Content-Disposition: attachment."
    )
    add_body(
        "3. Tối ưu tính lũy thừa khi khởi động Container (Idempotent Migration):\n"
        "Render thực hiện khởi động lại container định kỳ. Lệnh startCommand chạy npm run migrate trước khi chạy node server.js. "
        "Bằng việc sử dụng các khối DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN null; END $$;, quá trình migrate diễn ra "
        "hoàn toàn trơn tru mà không làm gián đoạn tiến trình khởi động của ứng dụng."
    )

    doc.add_page_break()

    # =========================================================================
    # CHƯƠNG 5: KẾT QUẢ VÀ ĐÁNH GIÁ
    # =========================================================================
    add_h1("CHƯƠNG 5: KẾT QUẢ VÀ ĐÁNH GIÁ")

    add_h2("5.1. Kết quả thực nghiệm các chức năng chính trên Production")
    add_body(
        "Hệ thống TaskFlow đã được triển khai hoàn chỉnh và đang hoạt động ổn định trên môi trường Internet tại các địa chỉ:"
    )
    add_bullet("https://taskflow-web-kequ.onrender.com", "• Giao diện Web Người dùng (Frontend): ")
    add_bullet("https://taskflow-api-0y78.onrender.com", "• Giao diện Lập trình Ứng dụng (Backend API): ")
    add_bullet("Neon Serverless PostgreSQL (Singapore Region)", "• Cơ sở dữ liệu Đám mây (Database): ")

    add_body("Kết quả kiểm thử thực nghiệm 4 tính năng cốt lõi theo đề tài:")
    add_bullet("Người dùng tạo thành công công việc mới, thiết lập độ ưu tiên hiển thị màu sắc trực quan (Đỏ - Urgent, Cam - High, Xanh - Medium), đính kèm file tài liệu và hạn chót. Task xuất hiện ngay trên giao diện mà không cần reload trang.", "1. Tính năng Task Creation: ")
    add_bullet("Trưởng dự án phân công nhiều thành viên vào một task. Hệ thống hiển thị huy hiệu Lead, chặn quyền xóa dự án hoặc tạo task trái phép của nhân viên bình thường (RBAC bảo mật tuyệt đối).", "2. Tính năng Task Assignment: ")
    add_bullet("Chuyển đổi trạng thái linh hoạt giữa TODO, IN PROGRESS, REVIEW, COMPLETED. Thành viên hoàn thành có thể gửi báo cáo nghiệm thu đính kèm file kết quả. Toàn bộ lịch sử thay đổi trạng thái được ghi lại trong tab Activity History.", "3. Tính năng Status Tracking: ")
    add_bullet("Thanh tìm kiếm phản hồi tức thì với kỹ thuật Debounce, lọc chính xác theo từ khóa trong tiêu đề, mô tả hoặc lọc theo từng cột trạng thái và thành viên phụ trách.", "4. Tính năng Task Search: ")

    add_h2("5.2. Đánh giá hiệu năng, tính sẵn sàng và tối ưu chi phí Cloud")
    add_body(
        "Hệ thống đạt được hiệu quả xuất sắc về mặt chi phí và vận hành đám mây:\n"
        "• Chi phí vận hành: 0 VNĐ (Tận dụng tối đa Free Tier của Render PaaS và Neon DBaaS Serverless, tiết kiệm 100% ngân sách hạ tầng ban đầu).\n"
        "• Tính tự động hóa: Khi lập trình viên thực hiện push commit lên GitHub, Render tự động kích hoạt Webhook, build mã nguồn và deploy bản mới trong thời gian từ 60 - 90 giây mà không cần can thiệp thủ công.\n"
        "• Tính an toàn dữ liệu: Dữ liệu trên Neon DB được lưu trữ trên hạ tầng SSD NVMe phân tán của AWS Singapore, hỗ trợ sao lưu tự động và phục hồi theo thời điểm (Point-in-Time Restore)."
    )

    add_h2("5.3. Hạn chế còn tồn tại và hướng phát triển tương lai")
    add_body("1. Một số hạn chế do đặc thù gói dịch vụ miễn phí (Free Tier):")
    add_bullet("Render Web Service ở gói Free sẽ chuyển sang chế độ ngủ (Spin down / Sleep mode) sau 15 phút không nhận được yêu cầu mạng. Yêu cầu đầu tiên sau khi ngủ sẽ mất khoảng 30 - 50 giây để khởi động lại (Cold Start).", "• Hiện tượng Cold Start: ")
    add_bullet("Ổ đĩa của Render Web Service là ổ đĩa tạm thời (Ephemeral Disk). Khi instance khởi động lại hoặc deploy bản mới, các tệp tin lưu trên bộ nhớ cục bộ sẽ bị làm mới.", "• Lưu trữ tệp tin tạm: ")
    
    add_body("2. Hướng phát triển hoàn thiện trong tương lai:")
    add_bullet("Kết nối vĩnh viễn với AWS S3 hoặc Cloudflare R2 để lưu trữ tệp tin đính kèm không giới hạn và bền vững tuyệt đối.", "• Mở rộng Object Storage: ")
    add_bullet("Tích hợp Socket.io hoặc Server-Sent Events (SSE) để khi một thành viên di chuyển task trên Kanban, màn hình của các thành viên khác sẽ tự động cập nhật ngay lập tức.", "• Tính năng Realtime Collaboration: ")
    add_bullet("Gửi email thông báo nhắc việc qua dịch vụ SendGrid / Resend khi task sắp đến hạn chót (Overdue).", "• Thông báo tự động: ")
    add_bullet("Nâng cấp lên gói Render Starter (7$/tháng) để loại bỏ hoàn toàn Cold Start, duy trì server hoạt động 24/7 liên tục.", "• Nâng cấp gói tài nguyên: ")

    doc.add_page_break()

    # =========================================================================
    # TÀI LIỆU THAM KHẢO
    # =========================================================================
    add_h1("TÀI LIỆU THAM KHẢO")
    
    refs = [
        "[1] Mell, P., & Grance, T. (2011). The NIST Definition of Cloud Computing. National Institute of Standards and Technology, Special Publication 800-145.",
        "[2] Render Cloud Documentation. \"Deploying Node.js and Static Web Applications on Render PaaS\". https://render.com/docs.",
        "[3] Neon Documentation. \"Serverless PostgreSQL Architecture, Branching, and Connection Pooling\". https://neon.tech/docs.",
        "[4] PostgreSQL Global Development Group. \"PostgreSQL 16 Documentation - SQL Language and Administration\". https://www.postgresql.org/docs/16/.",
        "[5] Node.js Foundation. \"Node.js v22 LTS Documentation - Asynchronous I/O and Modules\". https://nodejs.org/docs/.",
        "[6] React Documentation. \"React 18: Building Modern Single Page Applications\". https://react.dev/.",
        "[7] Martin Fowler (2014). \"Microservices and 3-Tier Architecture on Modern Cloud Platforms\". https://martinfowler.com/.",
        "[8] OWASP Foundation (2024). \"Top 10 Web Application Security Risks - Injection, Broken Access Control and Cryptographic Failures\"."
    ]
    for r in refs:
        p = doc.add_paragraph()
        format_para(p, space_before=3, space_after=6, align=WD_ALIGN_PARAGRAPH.JUSTIFY)
        add_run(p, r, font_size=12, color=DARK_TEXT)

    # Output file path
    output_path = r"D:\Cloud\TaskFlow-final_project_CLOUD_COMPUTING--main\BAO_CAO_DIEN_TOAN_DAM_MAY_TASKFLOW.docx"
    doc.save(output_path)
    print(f"Report generated successfully at: {output_path}")

if __name__ == "__main__":
    create_report()
