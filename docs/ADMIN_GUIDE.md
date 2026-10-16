# Hướng dẫn sử dụng trang quản trị

Đăng nhập: `https://<domain>/admin/login`. Hai vai trò:

- **Biên tập viên:** soạn/sửa câu hỏi, nhập hàng loạt, gửi duyệt, tạo bộ đề nháp, xử lý báo lỗi.
- **Quản trị viên:** tất cả quyền trên + duyệt, xuất bản, lưu trữ/xóa, quản lý lớp/chương/dạng toán, xuất bản bộ đề, quản lý tài khoản.

## 1. Soạn câu hỏi

Ngân hàng câu hỏi → **Tạo câu hỏi**. Chọn dạng toán, mức độ, loại câu.

Cú pháp nội dung (MathText) — có ô xem trước ngay bên cạnh:

| Muốn hiển thị | Gõ |
| --- | --- |
| Công thức trong dòng | `$2^5 + \dfrac{1}{2}$` |
| Công thức riêng một dòng | `$$\dfrac{a}{b} = \dfrac{c}{d}$$` |
| Nhân, chia | `$3 \cdot 4$`, `$12 : 3$` |
| Chia hết | `$a \,\vdots\, b$` |
| Tập hợp | `$A = \{1; 2; 3\}$` |
| Chữ trong công thức | `$\text{ƯCLN}(12, 18)$` |
| Dấu $ thường | `\$` |
| In đậm | `**Đáp án**` |
| Gạch đầu dòng | dòng bắt đầu bằng `- ` |
| Đoạn mới | một dòng trống |

Không dùng HTML (bị từ chối). Không chép nguyên văn sách giáo khoa.

Trắc nghiệm: nhập 4 phương án, chọn **đúng một** phương án đúng. Đáp án ngắn nên ghi dạng `**B.** $36$`.

## 2. Quy trình duyệt

```
Nháp ──Gửi duyệt──▶ Chờ duyệt ──Duyệt──▶ Đã duyệt ──Xuất bản──▶ Đã xuất bản
  ▲                    │                    │                      │
  └────Trả về nháp─────┴────────────────────┘        Gỡ xuất bản ◀─┘
Mọi trạng thái ──Lưu trữ──▶ Lưu trữ ──Khôi phục──▶ Nháp
```

- Chỉ câu **Đã xuất bản** xuất hiện trong đề tự tạo và có thể đưa vào bộ đề.
- Sửa nội dung câu đã duyệt/xuất bản → tạo phiên bản mới và câu tự chuyển về **Chờ duyệt** (cần duyệt lại). Các bộ đề cũ vẫn giữ phiên bản cũ nên đề và đáp án không bị lệch.
- Checklist khi duyệt: đúng kiến thức lớp 6 (GDPT 2018); đáp án đúng (tự giải lại); lời giải đủ bước, rõ ràng với học sinh 11–12 tuổi; công thức hiển thị đúng; mức độ hợp lý; không vi phạm bản quyền.
- Câu hỏi seed có ghi nguồn "đáp án đã kiểm tra tự động" — phép tính đã được máy kiểm chứng, nhưng vẫn nên rà soát văn phong và tính sư phạm.

## 3. Bộ đề

Bộ đề → **Tạo bộ đề**: nhập tiêu đề, (slug), mô tả, lớp/chương/dạng, mức độ, thời gian, danh sách **mã câu hỏi** theo thứ tự (mỗi dòng một mã, ví dụ `T6-C2-031`). Tạo xong ở trạng thái Nháp → quản trị viên bấm **Xuất bản**. Tích "Bộ đề nổi bật" để hiện trên trang chủ.

Trang sửa bộ đề cho biết câu nào đã có phiên bản mới. Bấm **Lưu bộ đề** để cập nhật lên phiên bản mới nhất.

## 4. Nhập hàng loạt

Nhập dữ liệu → chọn file JSON (≤ 1 MB, ≤ 500 câu; mẫu có trong trang) → **Kiểm tra** → nếu không có lỗi, bấm **Nhập**. Có bất kỳ dòng lỗi nào thì không câu nào được ghi. Câu nhập vào ở trạng thái Chờ duyệt.

## 5. Danh mục

Lớp học / Chương học / Dạng toán: sửa tên, slug, mô tả, kiến thức chính, tóm tắt kiến thức, ví dụ, trạng thái. Mục ở trạng thái Nháp/Lưu trữ không hiển thị công khai. Đổi slug sẽ đổi URL (ảnh hưởng SEO) — hạn chế đổi sau khi đã xuất bản. Thêm lớp 7 khi đã có nội dung: tạo lớp (Nháp) → chương → dạng toán → câu hỏi → xuất bản lớp.

## 6. Báo lỗi

Học sinh có thể bấm "Báo lỗi câu này" (ẩn danh). Xem ở **Báo lỗi** hoặc trong trang câu hỏi; sửa câu hỏi nếu cần rồi đánh dấu **Đã xử lý** hoặc **Bỏ qua**.

## 7. Tài khoản

Quản lý tài khoản (chỉ quản trị viên): tạo tài khoản với mật khẩu tạm (≥ 12 ký tự, có chữ và số), đổi vai trò, khóa/mở khóa. Khóa hoặc đổi vai trò sẽ đăng xuất người đó ngay. Mỗi người tự đổi mật khẩu ở **Cài đặt**.
