import type { SeedQuestion } from "../types";
import { type Frac, deq, fadd, feq, fcmp, fdiv, fmul, frac, fsub, range, roundTo, sameList } from "../verify";

const t = String.raw;
const C3 = "so-nguyen";
const C4 = "mot-so-hinh-phang-trong-thuc-tien";
const C6 = "phan-so";
const C7 = "so-thap-phan";
const C8 = "nhung-hinh-hinh-hoc-co-ban";
const C9 = "du-lieu-va-xac-suat-thuc-nghiem";

export const OTHER_QUESTIONS: SeedQuestion[] = [
  // ───────── Chương 3: Số nguyên ─────────
  {
    topic: `${C3}/so-nguyen-am-duong`, difficulty: "BASIC", type: "ESSAY", tags: ["thực tế"],
    content: t`Lúc $6$ giờ sáng, nhiệt độ ở một thị trấn vùng núi là $3\,^\circ\text{C}$ dưới $0\,^\circ\text{C}$. Hãy dùng số nguyên để biểu diễn nhiệt độ đó.`,
    answer: t`$-3\,^\circ\text{C}$`,
    solution: t`Nhiệt độ dưới $0\,^\circ\text{C}$ được biểu diễn bằng số nguyên âm. $3\,^\circ\text{C}$ dưới $0\,^\circ\text{C}$ được viết là $-3\,^\circ\text{C}$.`,
    // Câu hỏi khái niệm — không kiểm tra tự động, cần quản trị viên duyệt.
  },
  {
    topic: `${C3}/so-nguyen-am-duong`, difficulty: "BASIC", type: "SINGLE_CHOICE", tags: ["số đối"],
    content: t`Số đối của $-7$ là:`,
    options: [
      { label: "A", content: t`$7$`, correct: true },
      { label: "B", content: t`$-7$` },
      { label: "C", content: t`$0$` },
      { label: "D", content: t`$-\dfrac{1}{7}$` },
    ],
    answer: t`**A.** $7$`,
    solution: t`Hai số đối nhau có tổng bằng $0$: $(-7) + 7 = 0$. Vậy số đối của $-7$ là $7$.`,
    verify: () => -7 + 7 === 0,
  },
  {
    topic: `${C3}/so-sanh-so-nguyen`, difficulty: "BASIC", type: "ESSAY", tags: ["sắp xếp"],
    content: t`Sắp xếp các số nguyên sau theo thứ tự tăng dần: $-5;\ 3;\ 0;\ -12;\ 7;\ -1$.`,
    answer: t`$-12;\ -5;\ -1;\ 0;\ 3;\ 7$`,
    solution: t`Các số nguyên âm nhỏ hơn $0$ và nhỏ hơn các số nguyên dương. Trong các số âm, số có số đối lớn hơn thì nhỏ hơn: $-12 < -5 < -1$.

Thứ tự tăng dần: $-12;\ -5;\ -1;\ 0;\ 3;\ 7$.`,
    verify: () => sameList([-5, 3, 0, -12, 7, -1].sort((a, b) => a - b), [-12, -5, -1, 0, 3, 7]),
  },
  {
    topic: `${C3}/so-sanh-so-nguyen`, difficulty: "APPLIED", type: "SINGLE_CHOICE", tags: ["đếm số nguyên"],
    content: t`Có bao nhiêu số nguyên $x$ thỏa mãn $-3 < x \le 2$?`,
    options: [
      { label: "A", content: t`$4$` },
      { label: "B", content: t`$5$`, correct: true },
      { label: "C", content: t`$6$` },
      { label: "D", content: t`$3$` },
    ],
    answer: t`**B.** $5$`,
    solution: t`Các số nguyên $x$ thỏa mãn $-3 < x \le 2$ là $-2;\ -1;\ 0;\ 1;\ 2$ (không lấy $-3$, có lấy $2$). Có $5$ số.`,
    verify: () => range(-10, 10).filter((x) => x > -3 && x <= 2).length === 5,
  },
  {
    topic: `${C3}/cong-tru-so-nguyen`, difficulty: "BASIC", type: "ESSAY", tags: ["phép cộng"],
    content: t`Tính: a) $(-15) + (-23)$; $\quad$ b) $(-15) + 23$.`,
    answer: t`a) $-38$; $\quad$ b) $8$.`,
    solution: t`a) Cộng hai số nguyên âm: $(-15) + (-23) = -(15 + 23) = -38$.

b) Cộng hai số khác dấu: $23 - 15 = 8$, số $23$ có phần số lớn hơn và mang dấu "$+$" nên $(-15) + 23 = 8$.`,
    verify: () => -15 + -23 === -38 && -15 + 23 === 8,
  },
  {
    topic: `${C3}/cong-tru-so-nguyen`, difficulty: "BASIC", type: "ESSAY", tags: ["phép trừ"],
    content: t`Tính: a) $12 - 20$; $\quad$ b) $(-7) - (-10)$.`,
    answer: t`a) $-8$; $\quad$ b) $3$.`,
    solution: t`a) $12 - 20 = 12 + (-20) = -8$.

b) $(-7) - (-10) = (-7) + 10 = 3$.`,
    verify: () => 12 - 20 === -8 && -7 - -10 === 3,
  },
  {
    topic: `${C3}/cong-tru-so-nguyen`, difficulty: "APPLIED", type: "ESSAY", tags: ["tính nhanh"],
    content: t`Tính nhanh: $(-37) + 54 + (-63) + 46$.`,
    answer: t`$0$`,
    solution: t`$(-37) + 54 + (-63) + 46 = [(-37) + (-63)] + (54 + 46) = (-100) + 100 = 0$.`,
    verify: () => -37 + 54 + -63 + 46 === 0,
  },
  {
    topic: `${C3}/cong-tru-so-nguyen`, difficulty: "APPLIED", type: "ESSAY", tags: ["thực tế"],
    content: t`Một tàu ngầm đang ở độ cao $-50\,\text{m}$ so với mực nước biển. Sau đó tàu nổi lên thêm $18\,\text{m}$. Hỏi độ cao mới của tàu ngầm là bao nhiêu?`,
    answer: t`$-32\,\text{m}$`,
    solution: t`Nổi lên $18\,\text{m}$ nghĩa là độ cao tăng thêm $18$: $(-50) + 18 = -32$.

Độ cao mới của tàu ngầm là $-32\,\text{m}$ (tức là $32\,\text{m}$ dưới mực nước biển).`,
    verify: () => -50 + 18 === -32,
  },
  {
    topic: `${C3}/nhan-chia-so-nguyen`, difficulty: "BASIC", type: "ESSAY", tags: ["quy tắc dấu"],
    content: t`Tính: a) $(-6) \cdot 7$; $\quad$ b) $(-8) \cdot (-5)$; $\quad$ c) $(-72) : 9$.`,
    answer: t`a) $-42$; $\quad$ b) $40$; $\quad$ c) $-8$.`,
    solution: t`a) Hai số khác dấu: $(-6) \cdot 7 = -42$.

b) Hai số cùng dấu: $(-8) \cdot (-5) = 40$.

c) Hai số khác dấu: $(-72) : 9 = -8$.`,
    verify: () => -6 * 7 === -42 && -8 * -5 === 40 && -72 / 9 === -8,
  },
  {
    topic: `${C3}/nhan-chia-so-nguyen`, difficulty: "APPLIED", type: "ESSAY", tags: ["tính nhanh"],
    content: t`Tính hợp lí: $(-4) \cdot 25 \cdot (-3)$.`,
    answer: t`$300$`,
    solution: t`$(-4) \cdot 25 \cdot (-3) = [(-4) \cdot 25] \cdot (-3) = (-100) \cdot (-3) = 300$.`,
    verify: () => -4 * 25 * -3 === 300,
  },
  {
    topic: `${C3}/bieu-thuc-so-nguyen`, difficulty: "APPLIED", type: "ESSAY", tags: ["giá trị biểu thức"],
    content: t`Tính: $(-3) \cdot (-3) \cdot 4 - 5 \cdot (-6)$.`,
    answer: t`$66$`,
    solution: t`$(-3) \cdot (-3) \cdot 4 = 9 \cdot 4 = 36$; $\;5 \cdot (-6) = -30$.

$36 - (-30) = 36 + 30 = 66$.`,
    verify: () => -3 * -3 * 4 - 5 * -6 === 66,
  },
  {
    topic: `${C3}/bieu-thuc-so-nguyen`, difficulty: "ADVANCED", type: "ESSAY", tags: ["tìm x"],
    content: t`Tìm số nguyên $x$, biết: $3x + 17 = -4$.`,
    answer: t`$x = -7$`,
    solution: t`$3x = -4 - 17 = -21$.

$x = (-21) : 3 = -7$.`,
    verify: () => 3 * -7 + 17 === -4,
  },
  {
    topic: `${C3}/bieu-thuc-so-nguyen`, difficulty: "ADVANCED", type: "ESSAY", tags: ["tổng dãy số"],
    content: t`Tính tổng $S = 1 - 2 + 3 - 4 + \dots + 99 - 100$.`,
    answer: t`$S = -50$`,
    solution: t`Nhóm hai số hạng liên tiếp: $S = (1 - 2) + (3 - 4) + \dots + (99 - 100)$.

Có $100 : 2 = 50$ nhóm, mỗi nhóm bằng $-1$. Vậy $S = 50 \cdot (-1) = -50$.`,
    verify: () => range(1, 100).reduce((s, k) => s + (k % 2 === 1 ? k : -k), 0) === -50,
  },

  // ───────── Chương 4: Hình phẳng ─────────
  {
    topic: `${C4}/chu-vi`, difficulty: "BASIC", type: "ESSAY", tags: ["hình chữ nhật"],
    content: t`Một hình chữ nhật có chiều dài $12\,\text{cm}$, chiều rộng $7\,\text{cm}$. Tính chu vi và diện tích của hình chữ nhật đó.`,
    answer: t`Chu vi $38\,\text{cm}$; diện tích $84\,\text{cm}^2$.`,
    solution: t`Chu vi: $C = 2 \cdot (12 + 7) = 2 \cdot 19 = 38\,(\text{cm})$.

Diện tích: $S = 12 \cdot 7 = 84\,(\text{cm}^2)$.`,
    verify: () => 2 * (12 + 7) === 38 && 12 * 7 === 84,
  },
  {
    topic: `${C4}/dien-tich`, difficulty: "APPLIED", type: "ESSAY", tags: ["hình thoi"],
    content: t`Một hình thoi có độ dài hai đường chéo là $10\,\text{cm}$ và $16\,\text{cm}$. Tính diện tích hình thoi.`,
    answer: t`$80\,\text{cm}^2$`,
    solution: t`Diện tích hình thoi bằng nửa tích hai đường chéo: $S = \dfrac{10 \cdot 16}{2} = 80\,(\text{cm}^2)$.`,
    verify: () => (10 * 16) / 2 === 80,
  },
  {
    topic: `${C4}/dien-tich`, difficulty: "APPLIED", type: "ESSAY", tags: ["hình bình hành"],
    content: t`Một hình bình hành có độ dài cạnh đáy là $15\,\text{cm}$ và chiều cao tương ứng là $8\,\text{cm}$. Tính diện tích hình bình hành.`,
    answer: t`$120\,\text{cm}^2$`,
    solution: t`$S = 15 \cdot 8 = 120\,(\text{cm}^2)$.`,
    verify: () => 15 * 8 === 120,
  },
  {
    topic: `${C4}/bai-toan-thuc-te-hinh-phang`, difficulty: "ADVANCED", type: "ESSAY", tags: ["lối đi", "hình chữ nhật"],
    content: t`Một mảnh vườn hình chữ nhật dài $25\,\text{m}$, rộng $16\,\text{m}$. Người ta làm một lối đi rộng $1\,\text{m}$ chạy sát xung quanh bên trong mảnh vườn. Tính diện tích phần vườn còn lại.`,
    answer: t`$322\,\text{m}^2$`,
    solution: t`Phần còn lại là hình chữ nhật có chiều dài $25 - 2 \cdot 1 = 23\,(\text{m})$ và chiều rộng $16 - 2 \cdot 1 = 14\,(\text{m})$.

Diện tích phần còn lại: $23 \cdot 14 = 322\,(\text{m}^2)$.`,
    verify: () => (25 - 2) * (16 - 2) === 322,
  },

  // ───────── Chương 6: Phân số ─────────
  {
    topic: `${C6}/rut-gon-quy-dong`, difficulty: "BASIC", type: "ESSAY", tags: ["rút gọn"],
    content: t`Rút gọn phân số $\dfrac{18}{24}$ về phân số tối giản.`,
    answer: t`$\dfrac{3}{4}$`,
    solution: t`$\text{ƯCLN}(18, 24) = 6$ nên $\dfrac{18}{24} = \dfrac{18 : 6}{24 : 6} = \dfrac{3}{4}$.`,
    verify: () => feq(frac(18, 24), [3, 4]),
  },
  {
    topic: `${C6}/phan-so-bang-nhau`, difficulty: "BASIC", type: "SINGLE_CHOICE", tags: ["phân số bằng nhau"],
    content: t`Phân số nào sau đây bằng phân số $\dfrac{2}{3}$?`,
    options: [
      { label: "A", content: t`$\dfrac{4}{5}$` },
      { label: "B", content: t`$\dfrac{6}{9}$`, correct: true },
      { label: "C", content: t`$\dfrac{3}{2}$` },
      { label: "D", content: t`$\dfrac{4}{9}$` },
    ],
    answer: t`**B.** $\dfrac{6}{9}$`,
    solution: t`$\dfrac{6}{9} = \dfrac{6 : 3}{9 : 3} = \dfrac{2}{3}$. Hoặc kiểm tra: $2 \cdot 9 = 3 \cdot 6 = 18$.`,
    verify: () => feq([6, 9], [2, 3]) && !feq([4, 5], [2, 3]) && !feq([3, 2], [2, 3]) && !feq([4, 9], [2, 3]),
  },
  {
    topic: `${C6}/so-sanh-phan-so`, difficulty: "BASIC", type: "ESSAY", tags: ["so sánh"],
    content: t`So sánh hai phân số $\dfrac{3}{4}$ và $\dfrac{5}{6}$.`,
    answer: t`$\dfrac{3}{4} < \dfrac{5}{6}$`,
    solution: t`Quy đồng mẫu với mẫu chung $12$: $\dfrac{3}{4} = \dfrac{9}{12}$; $\;\dfrac{5}{6} = \dfrac{10}{12}$.

Vì $9 < 10$ nên $\dfrac{3}{4} < \dfrac{5}{6}$.`,
    verify: () => fcmp([3, 4], [5, 6]) < 0,
  },
  {
    topic: `${C6}/rut-gon-quy-dong`, difficulty: "APPLIED", type: "SINGLE_CHOICE", tags: ["mẫu chung"],
    content: t`Mẫu chung nhỏ nhất của hai phân số $\dfrac{1}{6}$ và $\dfrac{3}{8}$ là:`,
    options: [
      { label: "A", content: t`$48$` },
      { label: "B", content: t`$24$`, correct: true },
      { label: "C", content: t`$14$` },
      { label: "D", content: t`$12$` },
    ],
    answer: t`**B.** $24$`,
    solution: t`Mẫu chung nhỏ nhất là $\text{BCNN}(6, 8) = 24$.`,
    verify: () => range(1, 48).find((m) => m % 6 === 0 && m % 8 === 0) === 24,
  },
  {
    topic: `${C6}/cong-tru-phan-so`, difficulty: "APPLIED", type: "ESSAY", tags: ["phép cộng"],
    content: t`Tính: $\dfrac{2}{3} + \dfrac{1}{4}$.`,
    answer: t`$\dfrac{11}{12}$`,
    solution: t`$\dfrac{2}{3} + \dfrac{1}{4} = \dfrac{8}{12} + \dfrac{3}{12} = \dfrac{11}{12}$.`,
    verify: () => feq(fadd([2, 3], [1, 4]), [11, 12]),
  },
  {
    topic: `${C6}/cong-tru-phan-so`, difficulty: "APPLIED", type: "ESSAY", tags: ["phép trừ"],
    content: t`Tính: $\dfrac{5}{6} - \dfrac{3}{8}$.`,
    answer: t`$\dfrac{11}{24}$`,
    solution: t`Mẫu chung $24$: $\dfrac{5}{6} - \dfrac{3}{8} = \dfrac{20}{24} - \dfrac{9}{24} = \dfrac{11}{24}$.`,
    verify: () => feq(fsub([5, 6], [3, 8]), [11, 24]),
  },
  {
    topic: `${C6}/nhan-chia-phan-so`, difficulty: "APPLIED", type: "ESSAY", tags: ["phép nhân"],
    content: t`Tính: $\dfrac{3}{5} \cdot \dfrac{10}{9}$.`,
    answer: t`$\dfrac{2}{3}$`,
    solution: t`$\dfrac{3}{5} \cdot \dfrac{10}{9} = \dfrac{3 \cdot 10}{5 \cdot 9} = \dfrac{30}{45} = \dfrac{2}{3}$.`,
    verify: () => feq(fmul([3, 5], [10, 9]), [2, 3]),
  },
  {
    topic: `${C6}/nhan-chia-phan-so`, difficulty: "APPLIED", type: "ESSAY", tags: ["phép chia"],
    content: t`Tính: $\dfrac{4}{7} : \dfrac{2}{21}$.`,
    answer: t`$6$`,
    solution: t`Chia cho một phân số là nhân với phân số nghịch đảo của nó:

$\dfrac{4}{7} : \dfrac{2}{21} = \dfrac{4}{7} \cdot \dfrac{21}{2} = \dfrac{84}{14} = 6$.`,
    verify: () => feq(fdiv([4, 7], [2, 21]), [6, 1]),
  },
  {
    topic: `${C6}/bai-toan-phan-so`, difficulty: "APPLIED", type: "ESSAY", tags: ["giá trị phân số của một số"],
    content: t`Lớp 6A có $40$ học sinh, trong đó $\dfrac{3}{8}$ số học sinh thích bóng đá. Hỏi lớp 6A có bao nhiêu học sinh thích bóng đá?`,
    answer: t`$15$ học sinh.`,
    solution: t`Số học sinh thích bóng đá: $40 \cdot \dfrac{3}{8} = \dfrac{120}{8} = 15$ (học sinh).`,
    verify: () => feq(fmul([40, 1], [3, 8]), [15, 1]),
  },
  {
    topic: `${C6}/bai-toan-phan-so`, difficulty: "ADVANCED", type: "ESSAY", tags: ["tìm một số khi biết giá trị phân số"],
    content: t`Một bể nước đang chứa $\dfrac{2}{5}$ thể tích bể thì được $120$ lít nước. Hỏi khi đầy, bể chứa được bao nhiêu lít nước?`,
    answer: t`$300$ lít.`,
    solution: t`Thể tích bể là số mà $\dfrac{2}{5}$ của nó bằng $120$ lít:

$120 : \dfrac{2}{5} = 120 \cdot \dfrac{5}{2} = 300$ (lít).`,
    verify: () => feq(fdiv([120, 1], [2, 5]), [300, 1]),
  },
  {
    topic: `${C6}/cong-tru-phan-so`, difficulty: "ADVANCED", type: "ESSAY", tags: ["tổng dãy phân số"],
    content: t`Tính tổng: $A = \dfrac{1}{1 \cdot 2} + \dfrac{1}{2 \cdot 3} + \dfrac{1}{3 \cdot 4} + \dots + \dfrac{1}{9 \cdot 10}$.`,
    answer: t`$A = \dfrac{9}{10}$`,
    solution: t`Nhận xét: $\dfrac{1}{n(n+1)} = \dfrac{1}{n} - \dfrac{1}{n+1}$. Do đó

$A = \left(1 - \dfrac{1}{2}\right) + \left(\dfrac{1}{2} - \dfrac{1}{3}\right) + \dots + \left(\dfrac{1}{9} - \dfrac{1}{10}\right) = 1 - \dfrac{1}{10} = \dfrac{9}{10}$.`,
    verify: () => feq(range(1, 9).reduce<Frac>((s, n) => fadd(s, [1, n * (n + 1)]), [0, 1]), [9, 10]),
  },

  // ───────── Chương 7: Số thập phân ─────────
  {
    topic: `${C7}/cac-phep-tinh-so-thap-phan`, difficulty: "BASIC", type: "ESSAY", tags: ["phép cộng"],
    content: t`Tính: $3{,}25 + 4{,}7$.`,
    answer: t`$7{,}95$`,
    solution: t`Đặt tính thẳng hàng dấu phẩy: $3{,}25 + 4{,}70 = 7{,}95$.`,
    verify: () => deq(3.25 + 4.7, 7.95),
  },
  {
    topic: `${C7}/lam-tron`, difficulty: "BASIC", type: "ESSAY", tags: ["làm tròn"],
    content: t`Làm tròn số $12{,}3478$ đến hàng phần trăm.`,
    answer: t`$12{,}35$`,
    solution: t`Chữ số hàng phần trăm là $4$; chữ số ngay bên phải (hàng phần nghìn) là $7 \ge 5$ nên tăng chữ số hàng phần trăm thêm $1$ và bỏ các chữ số phía sau.

$12{,}3478 \approx 12{,}35$.`,
    verify: () => deq(roundTo(12.3478, 2), 12.35),
  },
  {
    topic: `${C7}/cac-phep-tinh-so-thap-phan`, difficulty: "APPLIED", type: "ESSAY", tags: ["phép nhân"],
    content: t`Tính: $2{,}5 \cdot 4{,}8$.`,
    answer: t`$12$`,
    solution: t`$2{,}5 \cdot 4{,}8 = 2{,}5 \cdot 4 \cdot 1{,}2 = 10 \cdot 1{,}2 = 12$.`,
    verify: () => deq(2.5 * 4.8, 12),
  },
  {
    topic: `${C7}/ti-so-phan-tram`, difficulty: "APPLIED", type: "ESSAY", tags: ["giá trị phần trăm"],
    content: t`Tính $25\%$ của $360$.`,
    answer: t`$90$`,
    solution: t`$25\%$ của $360$ là $360 \cdot \dfrac{25}{100} = 90$.`,
    verify: () => (360 * 25) / 100 === 90,
  },
  {
    topic: `${C7}/bai-toan-thuc-te-so-thap-phan`, difficulty: "APPLIED", type: "ESSAY", tags: ["giảm giá"],
    content: t`Một chiếc áo có giá niêm yết $250\,000$ đồng. Cửa hàng giảm giá $20\%$. Hỏi giá chiếc áo sau khi giảm là bao nhiêu?`,
    answer: t`$200\,000$ đồng.`,
    solution: t`Số tiền được giảm: $250\,000 \cdot 20\% = 50\,000$ (đồng).

Giá sau khi giảm: $250\,000 - 50\,000 = 200\,000$ (đồng).`,
    verify: () => 250_000 - (250_000 * 20) / 100 === 200_000,
  },
  {
    topic: `${C7}/ti-so-phan-tram`, difficulty: "ADVANCED", type: "ESSAY", tags: ["tỉ số phần trăm"],
    content: t`Lớp 6B có $36$ học sinh, trong đó có $27$ học sinh biết bơi. Tính tỉ số phần trăm số học sinh biết bơi so với số học sinh cả lớp.`,
    answer: t`$75\%$`,
    solution: t`Tỉ số phần trăm: $\dfrac{27}{36} \cdot 100\% = \dfrac{3}{4} \cdot 100\% = 75\%$.`,
    verify: () => (27 / 36) * 100 === 75,
  },

  // ───────── Chương 8: Hình học cơ bản ─────────
  {
    topic: `${C8}/trung-diem`, difficulty: "BASIC", type: "ESSAY", tags: ["trung điểm"],
    content: t`Cho đoạn thẳng $AB = 10\,\text{cm}$ và $M$ là trung điểm của đoạn thẳng $AB$. Tính độ dài đoạn thẳng $AM$.`,
    answer: t`$AM = 5\,\text{cm}$`,
    solution: t`$M$ là trung điểm của $AB$ nên $AM = MB = \dfrac{AB}{2} = \dfrac{10}{2} = 5\,(\text{cm})$.`,
    verify: () => 10 / 2 === 5,
  },
  {
    topic: `${C8}/tia-doan-thang`, difficulty: "APPLIED", type: "ESSAY", tags: ["độ dài đoạn thẳng"],
    content: t`Trên tia $Ox$ lấy hai điểm $A$ và $B$ sao cho $OA = 3\,\text{cm}$, $OB = 8\,\text{cm}$. Tính độ dài đoạn thẳng $AB$.`,
    answer: t`$AB = 5\,\text{cm}$`,
    solution: t`Hai điểm $A$, $B$ cùng nằm trên tia $Ox$ và $OA < OB$ nên điểm $A$ nằm giữa $O$ và $B$.

Do đó $OA + AB = OB$, suy ra $AB = 8 - 3 = 5\,(\text{cm})$.`,
    verify: () => 8 - 3 === 5,
  },

  // ───────── Chương 9: Dữ liệu và xác suất ─────────
  {
    topic: `${C9}/xac-suat-thuc-nghiem`, difficulty: "BASIC", type: "ESSAY", tags: ["xúc xắc"],
    content: t`Gieo một con xúc xắc $20$ lần, thấy mặt $6$ chấm xuất hiện $4$ lần. Tính xác suất thực nghiệm của sự kiện "Gieo được mặt $6$ chấm".`,
    answer: t`$\dfrac{1}{5}$`,
    solution: t`Xác suất thực nghiệm $= \dfrac{\text{số lần mặt 6 chấm xuất hiện}}{\text{tổng số lần gieo}} = \dfrac{4}{20} = \dfrac{1}{5}$.`,
    verify: () => feq(frac(4, 20), [1, 5]),
  },
  {
    topic: `${C9}/xac-suat-thuc-nghiem`, difficulty: "APPLIED", type: "ESSAY", tags: ["đồng xu"],
    content: t`Tung một đồng xu $50$ lần, thấy mặt ngửa (N) xuất hiện $28$ lần. Tính xác suất thực nghiệm của sự kiện "Đồng xu xuất hiện mặt sấp (S)".`,
    answer: t`$\dfrac{11}{25}$`,
    solution: t`Số lần xuất hiện mặt sấp: $50 - 28 = 22$ (lần).

Xác suất thực nghiệm: $\dfrac{22}{50} = \dfrac{11}{25}$.`,
    verify: () => feq(frac(50 - 28, 50), [11, 25]),
  },
];
