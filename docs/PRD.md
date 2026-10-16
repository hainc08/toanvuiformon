# PRD — Toán Vui

## 1. Mục tiêu

Thư viện bài tập Toán THCS trực quan, miễn phí. MVP tập trung **Toán lớp 6** (11–12 tuổi), kiến trúc sẵn sàng cho lớp 7, 8, 9 mà không phải viết lại.

Chỉ số thành công MVP: học sinh tìm được đề trong ≤ 3 thao tác từ trang chủ; tải PDF A4 không cần đăng nhập; 0 trường hợp lộ đáp án ngoài ý muốn; nội dung xuất bản 100% đã qua kiểm tra.

## 2. Người dùng

| Vai trò | Nhu cầu | Đăng nhập |
| --- | --- | --- |
| Học sinh | Tìm bài theo chương/dạng/mức độ, làm bài, xem lời giải | Không |
| Phụ huynh | Tìm/in đề cho con | Không |
| Giáo viên | Tạo đề tùy chỉnh, in đề + đáp án riêng | Không (MVP) |
| Biên tập viên (EDITOR) | Soạn, sửa, nhập câu hỏi; gửi duyệt | Có |
| Quản trị viên (ADMIN) | Duyệt, xuất bản, quản lý danh mục, bộ đề, tài khoản | Có |

## 3. Phạm vi MVP (đã triển khai)

- Trang chủ (hero, chương, bộ đề nổi bật, theo độ khó, 3 bước, FAQ, footer).
- `/lop-6`, `/lop-6/[chương]`, `/lop-6/[chương]/[dạng]`, `/thu-vien`, `/de-bai/[slug]`, `/tao-de`.
- PDF đề (có ô họ tên/lớp/ngày, thời gian đề xuất, đánh số câu, dòng kẻ trình bày, số trang) và PDF đáp án riêng.
- Đáp án tách khỏi HTML ban đầu; tải qua API khi người học bấm "Xem đáp án".
- Tạo đề tự động: lớp, chương, dạng toán (1 hoặc nhiều), mức độ (Cơ bản/Vận dụng/Nâng cao/Trộn), 10/20/30 câu, trộn thứ tự, trộn dạng; backend kiểm tra đủ câu.
- Admin: dashboard, lớp/chương/dạng toán, ngân hàng câu hỏi (search/filter/pagination/CRUD/preview KaTeX/lịch sử phiên bản/người tạo-sửa-duyệt), quy trình duyệt, bộ đề, nhập JSON hàng loạt, báo lỗi, tài khoản, cài đặt (đổi mật khẩu).
- SEO, responsive mobile-first, accessibility, kiểm thử, CI/CD, Docker.

## 4. Phase 2 (đã chuẩn bị, chưa làm)

Làm bài trực tuyến, chấm điểm tự động (dữ liệu `QuestionOption.isCorrect` và `answer` đã có), lưu tiến độ, dashboard học sinh, báo cáo phụ huynh, gợi ý bài tập, AI sinh câu hỏi (bắt buộc qua `PENDING_REVIEW`). Bảng dự kiến: `attempts`, `attempt_answers`, `user_progress`, `favorites` (xem DATABASE.md §6).

**Tài khoản trẻ em (Phase 2):** không thu thập ngày sinh/số điện thoại; ưu tiên tài khoản do phụ huynh/giáo viên tạo, đăng nhập bằng mã lớp/biệt danh. Trước khi triển khai phải rà soát Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân (dữ liệu trẻ em cần sự đồng ý của cha mẹ/người giám hộ) và Luật Trẻ em 2016 — cần tư vấn pháp lý, không chỉ dựa vào tài liệu này.

## 5. Nội dung

- Danh mục 9 chương theo Chương trình GDPT 2018; thứ tự và tên chương bám bộ sách *Kết nối tri thức với cuộc sống*. Bộ *Cánh diều* và *Chân trời sáng tạo* sắp xếp khác — chỉnh trong Admin nếu cần (dữ liệu nằm trong DB, không hardcode ở frontend).
- Câu hỏi, tóm tắt kiến thức, ví dụ do Toán Vui tự biên soạn; không sao chép sách giáo khoa hay nguồn thương mại.
- Mỗi câu hỏi: mã, lớp, chương, dạng, độ khó, loại, nội dung, đáp án, lời giải từng bước, tags, trạng thái, nguồn, thời điểm tạo/sửa, người tạo/sửa/duyệt.
- Loại câu: Tự luận, Trắc nghiệm 1 đáp án (đầy đủ), Điền kết quả, Đúng/Sai (mở rộng).
- Quy tắc xuất bản: chỉ câu `APPROVED` mới được `PUBLISHED`; sửa nội dung câu đã duyệt → tự động về `PENDING_REVIEW`.
- Seed: 134 câu (133 có kiểm chứng tự động bằng phép tính → xuất bản; 1 câu khái niệm để `PENDING_REVIEW`). Đặt `SEED_PUBLISH_VERIFIED=false` nếu muốn giáo viên duyệt toàn bộ trước khi công khai. **Khuyến nghị:** giáo viên rà soát văn phong/sư phạm của các câu đã seed.

## 6. Yêu cầu phi chức năng

- Hiệu năng: SSR, JS tối thiểu ở trang công khai, font tự host, mục tiêu Lighthouse 90+.
- Bảo mật: RBAC, CSRF (SameSite + kiểm tra Origin), rate limit, chống XSS/SQLi/IDOR, cookie httpOnly, không log dữ liệu nhạy cảm.
- Quyền riêng tư: không cookie theo dõi, không analytics bên thứ ba, không lưu IP; báo lỗi ẩn danh.
- Không quảng cáo, không popup, không dark pattern.
