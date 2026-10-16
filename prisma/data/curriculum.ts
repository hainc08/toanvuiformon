import type { SeedChapter } from "./types";

/**
 * Toán 6 — danh mục chương/dạng toán khởi tạo theo Chương trình GDPT 2018.
 * Thứ tự chương bám theo bộ sách "Kết nối tri thức với cuộc sống"; các bộ sách khác
 * (Cánh diều, Chân trời sáng tạo) sắp xếp khác — xem docs/PRD.md mục "Nội dung".
 * Tóm tắt kiến thức và ví dụ do Toán Vui tự biên soạn, không sao chép sách giáo khoa.
 */
const t = String.raw;

export const GRADE_6 = {
  level: 6,
  name: "Lớp 6",
  slug: "lop-6",
  description: "Toán lớp 6 theo Chương trình Giáo dục phổ thông 2018: số tự nhiên, số nguyên, phân số, số thập phân, hình học trực quan, thống kê và xác suất.",
};

export const CURRICULUM = {
  code: "GDPT2018",
  name: "Chương trình Giáo dục phổ thông 2018",
  description: "Chương trình môn Toán ban hành kèm Thông tư 32/2018/TT-BGDĐT.",
};

export const CHAPTERS: SeedChapter[] = [
  {
    number: 1,
    slug: "tap-hop-cac-so-tu-nhien",
    title: "Tập hợp các số tự nhiên",
    summary: "Làm quen với tập hợp, cách ghi số tự nhiên và các phép tính cộng, trừ, nhân, chia, lũy thừa.",
    keyPoints: ["Tập hợp và phần tử", "Ghi số tự nhiên, số La Mã", "Bốn phép tính và tính chất", "Lũy thừa với số mũ tự nhiên", "Thứ tự thực hiện phép tính"],
    topics: [
      {
        slug: "tap-hop",
        title: "Tập hợp",
        summary: "Cách viết tập hợp, kí hiệu thuộc và không thuộc.",
        knowledgeSummary: t`- Tập hợp thường được kí hiệu bằng chữ cái in hoa: $A, B, C, \dots$
- $a \in A$ đọc là "$a$ thuộc $A$"; $b \notin A$ đọc là "$b$ không thuộc $A$".
- Hai cách viết tập hợp: **liệt kê các phần tử** hoặc **chỉ ra tính chất đặc trưng** của các phần tử.
- $\mathbb{N}$ là tập hợp các số tự nhiên, $\mathbb{N}^*$ là tập hợp các số tự nhiên khác $0$.`,
        example: t`Tập hợp $P$ các số tự nhiên nhỏ hơn $5$: $P = \{0; 1; 2; 3; 4\}$ hay $P = \{x \in \mathbb{N} \mid x < 5\}$.`,
      },
      {
        slug: "doc-viet-so-sanh-so-tu-nhien",
        title: "Đọc, viết, so sánh số tự nhiên",
        summary: "Hệ thập phân, giá trị chữ số theo vị trí, số La Mã và so sánh số tự nhiên.",
        knowledgeSummary: t`- Trong hệ thập phân, giá trị của mỗi chữ số phụ thuộc vào **vị trí** của nó.
- Số La Mã dùng các kí tự $\text{I} = 1$, $\text{V} = 5$, $\text{X} = 10$; ví dụ $\text{IV} = 4$, $\text{IX} = 9$.
- Trong hai số tự nhiên có số chữ số khác nhau, số nào nhiều chữ số hơn thì lớn hơn; nếu cùng số chữ số thì so sánh từng cặp chữ số từ trái sang phải.`,
        example: t`Trong số $3\,582$, chữ số $5$ có giá trị là $500$.`,
      },
      {
        slug: "cong-tru-nhan-chia",
        title: "Cộng, trừ, nhân, chia số tự nhiên",
        summary: "Các phép tính với số tự nhiên và tính chất giúp tính nhanh.",
        knowledgeSummary: t`- Phép cộng và phép nhân có tính chất **giao hoán**, **kết hợp**.
- Tính chất phân phối: $a \cdot (b + c) = a \cdot b + a \cdot c$.
- Phép chia có dư: $a = b \cdot q + r$ với $0 \le r < b$.`,
        example: t`$25 \cdot 13 \cdot 4 = (25 \cdot 4) \cdot 13 = 100 \cdot 13 = 1\,300$.`,
      },
      {
        slug: "luy-thua",
        title: "Lũy thừa với số mũ tự nhiên",
        summary: "Định nghĩa lũy thừa, nhân và chia hai lũy thừa cùng cơ số.",
        knowledgeSummary: t`- $a^n = \underbrace{a \cdot a \cdots a}_{n \text{ thừa số}}$ với $n \in \mathbb{N}^*$; quy ước $a^0 = 1$ ($a \ne 0$).
- $a^m \cdot a^n = a^{m+n}$.
- $a^m : a^n = a^{m-n}$ với $a \ne 0$, $m \ge n$.`,
        example: t`$2^3 \cdot 2^4 = 2^7 = 128$.`,
      },
      {
        slug: "thu-tu-thuc-hien-phep-tinh",
        title: "Thứ tự thực hiện phép tính",
        summary: "Quy tắc thực hiện phép tính trong biểu thức có và không có dấu ngoặc.",
        knowledgeSummary: t`- Không có ngoặc: **lũy thừa** $\to$ **nhân, chia** $\to$ **cộng, trừ**.
- Có ngoặc: thực hiện trong ngoặc tròn $( )$ $\to$ ngoặc vuông $[ ]$ $\to$ ngoặc nhọn $\{ \}$.`,
        example: t`$60 - 2 \cdot 3^2 = 60 - 2 \cdot 9 = 60 - 18 = 42$.`,
      },
      {
        slug: "tim-x",
        title: "Tìm số tự nhiên x",
        summary: "Tìm thành phần chưa biết trong phép tính.",
        knowledgeSummary: t`- Số hạng = Tổng $-$ Số hạng đã biết; Số bị trừ = Hiệu $+$ Số trừ.
- Thừa số = Tích $:$ Thừa số đã biết; Số bị chia = Thương $\cdot$ Số chia.
- Với các bài nhiều bước, coi cả cụm chứa $x$ là một thành phần chưa biết.`,
        example: t`$4x + 7 = 31 \Rightarrow 4x = 24 \Rightarrow x = 6$.`,
      },
    ],
  },
  {
    number: 2,
    slug: "tinh-chia-het-trong-tap-hop-so-tu-nhien",
    title: "Tính chia hết trong tập hợp các số tự nhiên",
    summary: "Quan hệ chia hết, dấu hiệu chia hết, số nguyên tố, ước chung lớn nhất và bội chung nhỏ nhất.",
    keyPoints: ["Dấu hiệu chia hết cho 2, 3, 5, 9", "Ước và bội", "Số nguyên tố, hợp số", "ƯCLN và BCNN"],
    topics: [
      {
        slug: "dau-hieu-chia-het",
        title: "Dấu hiệu chia hết cho 2, 3, 5, 9",
        summary: "Nhận biết nhanh một số có chia hết cho 2, 3, 5, 9 hay không.",
        knowledgeSummary: t`- Chia hết cho $2$: chữ số tận cùng là $0; 2; 4; 6; 8$.
- Chia hết cho $5$: chữ số tận cùng là $0$ hoặc $5$.
- Chia hết cho $3$ (hoặc $9$): tổng các chữ số chia hết cho $3$ (hoặc $9$).
- Nếu mỗi số hạng của tổng đều chia hết cho $m$ thì tổng chia hết cho $m$.`,
        example: t`$5\,247$ có tổng các chữ số $5 + 2 + 4 + 7 = 18$ nên chia hết cho cả $3$ và $9$.`,
      },
      {
        slug: "uoc-va-boi",
        title: "Ước và bội",
        summary: "Tìm ước, tìm bội của một số tự nhiên.",
        knowledgeSummary: t`- Nếu $a \,\vdots\, b$ thì $a$ là **bội** của $b$, $b$ là **ước** của $a$.
- Tìm ước của $a$: chia $a$ lần lượt cho $1, 2, \dots, a$.
- Tìm bội của $b$ ($b \ne 0$): nhân $b$ lần lượt với $0, 1, 2, 3, \dots$`,
        example: t`$\text{Ư}(12) = \{1; 2; 3; 4; 6; 12\}$.`,
      },
      {
        slug: "so-nguyen-to",
        title: "Số nguyên tố, hợp số",
        summary: "Phân biệt số nguyên tố và hợp số.",
        knowledgeSummary: t`- Số nguyên tố là số tự nhiên lớn hơn $1$, chỉ có hai ước là $1$ và chính nó.
- Hợp số là số tự nhiên lớn hơn $1$, có nhiều hơn hai ước.
- Số $0$ và số $1$ không là số nguyên tố, cũng không là hợp số. Số $2$ là số nguyên tố chẵn duy nhất.`,
        example: t`$17$ là số nguyên tố; $15 = 3 \cdot 5$ là hợp số.`,
      },
      {
        slug: "phan-tich-thua-so-nguyen-to",
        title: "Phân tích ra thừa số nguyên tố",
        summary: "Viết một hợp số dưới dạng tích các thừa số nguyên tố.",
        knowledgeSummary: t`- Mỗi hợp số đều phân tích được thành tích các thừa số nguyên tố, và kết quả là duy nhất (không kể thứ tự).
- Có thể phân tích theo **cột dọc** hoặc **sơ đồ cây**; nên viết kết quả gọn bằng lũy thừa, các thừa số theo thứ tự tăng dần.`,
        example: t`$90 = 2 \cdot 3^2 \cdot 5$.`,
      },
      {
        slug: "uoc-chung-lon-nhat",
        title: "Ước chung lớn nhất",
        summary: "Tìm ƯC và ƯCLN; bài toán chia đều.",
        knowledgeSummary: t`- Cách tìm ƯCLN: phân tích các số ra thừa số nguyên tố, chọn các thừa số **chung**, mỗi thừa số lấy với số mũ **nhỏ nhất**, rồi lập tích.
- Các ước chung là các ước của ƯCLN.
- Hai số có ƯCLN bằng $1$ gọi là hai số nguyên tố cùng nhau.`,
        example: t`$12 = 2^2 \cdot 3$, $30 = 2 \cdot 3 \cdot 5$ nên $\text{ƯCLN}(12, 30) = 2 \cdot 3 = 6$.`,
      },
      {
        slug: "boi-chung-nho-nhat",
        title: "Bội chung nhỏ nhất",
        summary: "Tìm BC và BCNN; bài toán lặp lại theo chu kì.",
        knowledgeSummary: t`- Cách tìm BCNN: phân tích các số ra thừa số nguyên tố, chọn các thừa số **chung và riêng**, mỗi thừa số lấy với số mũ **lớn nhất**, rồi lập tích.
- Các bội chung là các bội của BCNN.`,
        example: t`$4 = 2^2$, $6 = 2 \cdot 3$ nên $\text{BCNN}(4, 6) = 2^2 \cdot 3 = 12$.`,
      },
    ],
  },
  {
    number: 3,
    slug: "so-nguyen",
    title: "Số nguyên",
    summary: "Số nguyên âm, tập hợp số nguyên, các phép tính và quy tắc dấu ngoặc.",
    keyPoints: ["Số nguyên âm và trục số", "So sánh số nguyên", "Cộng, trừ, nhân, chia số nguyên", "Quy tắc dấu ngoặc"],
    topics: [
      {
        slug: "so-nguyen-am-duong",
        title: "Số nguyên âm và số nguyên dương",
        summary: "Biểu diễn đại lượng thực tế bằng số nguyên, số đối.",
        knowledgeSummary: t`- Tập hợp số nguyên: $\mathbb{Z} = \{\dots; -2; -1; 0; 1; 2; \dots\}$.
- Số $0$ không là số nguyên âm, cũng không là số nguyên dương.
- Hai số nằm về hai phía điểm $0$ và cách đều điểm $0$ trên trục số là hai số đối nhau.`,
        example: t`Số đối của $-9$ là $9$; số đối của $4$ là $-4$.`,
      },
      {
        slug: "so-sanh-so-nguyen",
        title: "So sánh số nguyên",
        summary: "Thứ tự trên trục số.",
        knowledgeSummary: t`- Trên trục số nằm ngang, điểm $a$ nằm bên trái điểm $b$ thì $a < b$.
- Mọi số nguyên âm đều nhỏ hơn $0$ và nhỏ hơn mọi số nguyên dương.
- Với hai số nguyên âm, số nào có số đối lớn hơn thì nhỏ hơn.`,
        example: t`$-8 < -3$ vì $8 > 3$.`,
      },
      {
        slug: "cong-tru-so-nguyen",
        title: "Cộng, trừ số nguyên",
        summary: "Cộng hai số cùng dấu, khác dấu; phép trừ số nguyên.",
        knowledgeSummary: t`- Cộng hai số nguyên âm: cộng hai số đối của chúng rồi đặt dấu "$-$" trước kết quả.
- Cộng hai số khác dấu: lấy số lớn trừ số nhỏ (bỏ dấu), đặt trước kết quả dấu của số có phần số lớn hơn.
- $a - b = a + (-b)$.`,
        example: t`$(-12) + 5 = -7$; $\;4 - 9 = 4 + (-9) = -5$.`,
      },
      {
        slug: "nhan-chia-so-nguyen",
        title: "Nhân, chia số nguyên",
        summary: "Quy tắc dấu khi nhân, chia.",
        knowledgeSummary: t`- Tích (thương) hai số cùng dấu là số dương; khác dấu là số âm.
- $a \cdot 0 = 0$.`,
        example: t`$(-4) \cdot (-6) = 24$; $\;(-35) : 7 = -5$.`,
      },
      {
        slug: "bieu-thuc-so-nguyen",
        title: "Biểu thức với số nguyên",
        summary: "Tính giá trị biểu thức, quy tắc dấu ngoặc, tìm x trong tập số nguyên.",
        knowledgeSummary: t`- Bỏ ngoặc có dấu "$-$" đằng trước: đổi dấu tất cả các số hạng trong ngoặc.
- Bỏ ngoặc có dấu "$+$" đằng trước: giữ nguyên dấu các số hạng.`,
        example: t`$15 - (7 - 20) = 15 - 7 + 20 = 28$.`,
      },
    ],
  },
  {
    number: 4,
    slug: "mot-so-hinh-phang-trong-thuc-tien",
    title: "Một số hình phẳng trong thực tiễn",
    summary: "Tam giác đều, hình vuông, lục giác đều, hình chữ nhật, hình thoi, hình bình hành, hình thang cân.",
    keyPoints: ["Nhận biết hình phẳng", "Chu vi các hình", "Diện tích các hình", "Bài toán thực tế"],
    topics: [
      { slug: "nhan-biet-hinh-phang", title: "Nhận biết hình phẳng", summary: "Đặc điểm về cạnh, góc, đường chéo của các hình quen thuộc." },
      {
        slug: "chu-vi",
        title: "Chu vi",
        summary: "Công thức chu vi các hình.",
        knowledgeSummary: t`- Hình vuông cạnh $a$: $C = 4a$.
- Hình chữ nhật chiều dài $a$, chiều rộng $b$: $C = 2(a + b)$.
- Hình thoi cạnh $a$: $C = 4a$; hình bình hành cạnh $a, b$: $C = 2(a + b)$.`,
      },
      {
        slug: "dien-tich",
        title: "Diện tích",
        summary: "Công thức diện tích các hình.",
        knowledgeSummary: t`- Hình chữ nhật: $S = a \cdot b$; hình vuông: $S = a^2$.
- Hình thoi có hai đường chéo $m, n$: $S = \dfrac{m \cdot n}{2}$.
- Hình bình hành cạnh đáy $a$, chiều cao $h$: $S = a \cdot h$.
- Hình thang đáy $a, b$, chiều cao $h$: $S = \dfrac{(a + b) \cdot h}{2}$.`,
      },
      { slug: "bai-toan-thuc-te-hinh-phang", title: "Bài toán thực tế", summary: "Vận dụng chu vi, diện tích vào tình huống thực tế." },
    ],
  },
  {
    number: 5,
    slug: "tinh-doi-xung-cua-hinh-phang",
    title: "Tính đối xứng của hình phẳng trong tự nhiên",
    summary: "Hình có trục đối xứng, hình có tâm đối xứng và vai trò của tính đối xứng.",
    keyPoints: ["Trục đối xứng", "Tâm đối xứng", "Nhận biết, vẽ hình đối xứng"],
    topics: [
      { slug: "truc-doi-xung", title: "Hình có trục đối xứng", summary: "Nhận biết trục đối xứng của một hình." },
      { slug: "tam-doi-xung", title: "Hình có tâm đối xứng", summary: "Nhận biết tâm đối xứng của một hình." },
      { slug: "nhan-biet-ve-hinh-doi-xung", title: "Nhận biết, vẽ hình đối xứng", summary: "Hoàn thiện hình đối xứng trên lưới ô vuông." },
    ],
  },
  {
    number: 6,
    slug: "phan-so",
    title: "Phân số",
    summary: "Phân số với tử và mẫu là số nguyên, so sánh và các phép tính với phân số.",
    keyPoints: ["Phân số bằng nhau", "Rút gọn, quy đồng", "So sánh phân số", "Bốn phép tính", "Hai bài toán về phân số"],
    topics: [
      {
        slug: "phan-so-bang-nhau",
        title: "Phân số bằng nhau",
        summary: "Tính chất cơ bản của phân số.",
        knowledgeSummary: t`- $\dfrac{a}{b} = \dfrac{c}{d}$ nếu $a \cdot d = b \cdot c$.
- Nhân (hoặc chia) cả tử và mẫu với cùng một số khác $0$ (là ước chung) ta được phân số bằng phân số đã cho.`,
        example: t`$\dfrac{3}{5} = \dfrac{6}{10}$ vì $3 \cdot 10 = 5 \cdot 6$.`,
      },
      {
        slug: "rut-gon-quy-dong",
        title: "Rút gọn và quy đồng mẫu",
        summary: "Phân số tối giản, mẫu chung nhỏ nhất.",
        knowledgeSummary: t`- Rút gọn: chia cả tử và mẫu cho ƯCLN của chúng để được phân số tối giản.
- Quy đồng: lấy mẫu chung (thường là BCNN của các mẫu), tìm thừa số phụ rồi nhân cả tử và mẫu với thừa số phụ.`,
        example: t`$\dfrac{12}{18} = \dfrac{12 : 6}{18 : 6} = \dfrac{2}{3}$.`,
      },
      { slug: "so-sanh-phan-so", title: "So sánh phân số", summary: "So sánh hai phân số cùng mẫu, khác mẫu." },
      { slug: "cong-tru-phan-so", title: "Cộng, trừ phân số", summary: "Cộng, trừ phân số cùng mẫu và khác mẫu." },
      { slug: "nhan-chia-phan-so", title: "Nhân, chia phân số", summary: "Phép nhân, phân số nghịch đảo, phép chia." },
      { slug: "bai-toan-phan-so", title: "Bài toán về phân số", summary: "Tìm giá trị phân số của một số và tìm một số khi biết giá trị phân số của nó." },
    ],
  },
  {
    number: 7,
    slug: "so-thap-phan",
    title: "Số thập phân",
    summary: "Số thập phân, các phép tính, làm tròn, ước lượng và tỉ số phần trăm.",
    keyPoints: ["Số thập phân", "Các phép tính", "Làm tròn và ước lượng", "Tỉ số và tỉ số phần trăm"],
    topics: [
      { slug: "so-thap-phan", title: "Số thập phân", summary: "Phân số thập phân, so sánh số thập phân." },
      { slug: "cac-phep-tinh-so-thap-phan", title: "Các phép tính với số thập phân", summary: "Cộng, trừ, nhân, chia số thập phân." },
      { slug: "lam-tron", title: "Làm tròn và ước lượng", summary: "Làm tròn số thập phân đến hàng cho trước." },
      { slug: "ti-so-phan-tram", title: "Tỉ số phần trăm", summary: "Tỉ số, tỉ số phần trăm, tìm giá trị phần trăm của một số." },
      { slug: "bai-toan-thuc-te-so-thap-phan", title: "Bài toán thực tế", summary: "Giảm giá, lãi suất, khuyến mãi." },
    ],
  },
  {
    number: 8,
    slug: "nhung-hinh-hinh-hoc-co-ban",
    title: "Những hình hình học cơ bản",
    summary: "Điểm, đường thẳng, tia, đoạn thẳng, trung điểm và góc.",
    keyPoints: ["Điểm và đường thẳng", "Tia, đoạn thẳng", "Trung điểm", "Góc và số đo góc"],
    topics: [
      { slug: "diem-va-duong-thang", title: "Điểm và đường thẳng", summary: "Điểm thuộc, không thuộc đường thẳng; ba điểm thẳng hàng." },
      { slug: "tia-doan-thang", title: "Tia, đoạn thẳng", summary: "Tia, đoạn thẳng, độ dài đoạn thẳng." },
      {
        slug: "trung-diem",
        title: "Trung điểm của đoạn thẳng",
        summary: "Trung điểm chia đoạn thẳng thành hai phần bằng nhau.",
        knowledgeSummary: t`- $M$ là trung điểm của đoạn thẳng $AB$ nếu $M$ nằm giữa $A, B$ và $MA = MB$.
- Khi đó $MA = MB = \dfrac{AB}{2}$.`,
      },
      { slug: "goc", title: "Góc", summary: "Khái niệm góc, đỉnh, cạnh, điểm trong của góc." },
      { slug: "so-do-goc", title: "Số đo góc", summary: "Đo góc, góc nhọn, góc vuông, góc tù, góc bẹt." },
    ],
  },
  {
    number: 9,
    slug: "du-lieu-va-xac-suat-thuc-nghiem",
    title: "Dữ liệu và xác suất thực nghiệm",
    summary: "Thu thập, biểu diễn dữ liệu; kết quả có thể và xác suất thực nghiệm.",
    keyPoints: ["Thu thập và phân loại dữ liệu", "Bảng thống kê, biểu đồ", "Xác suất thực nghiệm"],
    topics: [
      { slug: "thu-thap-du-lieu", title: "Thu thập và phân loại dữ liệu", summary: "Dữ liệu số, dữ liệu không phải số." },
      { slug: "bang-thong-ke", title: "Bảng thống kê", summary: "Biểu diễn dữ liệu bằng bảng." },
      { slug: "bieu-do", title: "Biểu đồ", summary: "Biểu đồ tranh, biểu đồ cột, biểu đồ cột kép." },
      {
        slug: "xac-suat-thuc-nghiem",
        title: "Xác suất thực nghiệm",
        summary: "Tính xác suất thực nghiệm từ số lần xuất hiện.",
        knowledgeSummary: t`- Thực hiện một hoạt động $n$ lần, sự kiện $A$ xảy ra $k$ lần thì xác suất thực nghiệm của $A$ là $\dfrac{k}{n}$.`,
        example: t`Tung đồng xu $20$ lần, mặt sấp xuất hiện $9$ lần: xác suất thực nghiệm là $\dfrac{9}{20}$.`,
      },
    ],
  },
];
