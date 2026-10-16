import type { SeedQuestion } from "../types";
import { range, sameList, toRoman } from "../verify";

const t = String.raw;
const C = "tap-hop-cac-so-tu-nhien";

export const CHAPTER_1_QUESTIONS: SeedQuestion[] = [
  // ── Tập hợp ──
  {
    topic: `${C}/tap-hop`, difficulty: "BASIC", type: "ESSAY", tags: ["liệt kê phần tử"],
    content: t`Viết tập hợp $A$ các số tự nhiên lớn hơn $3$ và nhỏ hơn $9$ bằng cách liệt kê các phần tử.`,
    answer: t`$A = \{4; 5; 6; 7; 8\}$`,
    solution: t`Các số tự nhiên lớn hơn $3$ và nhỏ hơn $9$ là $4, 5, 6, 7, 8$.

Vậy $A = \{4; 5; 6; 7; 8\}$.`,
    verify: () => sameList(range(0, 20).filter((x) => x > 3 && x < 9), [4, 5, 6, 7, 8]),
  },
  {
    topic: `${C}/tap-hop`, difficulty: "BASIC", type: "SINGLE_CHOICE", tags: ["kí hiệu thuộc"],
    content: t`Cho tập hợp $B = \{2; 4; 6; 8\}$. Khẳng định nào sau đây đúng?`,
    options: [
      { label: "A", content: t`$3 \in B$` },
      { label: "B", content: t`$6 \in B$`, correct: true },
      { label: "C", content: t`$8 \notin B$` },
      { label: "D", content: t`$4 \notin B$` },
    ],
    answer: t`**B.** $6 \in B$`,
    solution: t`Tập hợp $B$ có các phần tử $2, 4, 6, 8$.
- $3$ không là phần tử của $B$ nên A sai.
- $6$ là phần tử của $B$ nên $6 \in B$: B đúng.
- $8$ và $4$ đều thuộc $B$ nên C, D sai.`,
    verify: () => {
      const B = [2, 4, 6, 8];
      return B.includes(6) && !B.includes(3) && B.includes(8) && B.includes(4);
    },
  },
  {
    topic: `${C}/tap-hop`, difficulty: "BASIC", type: "ESSAY", tags: ["liệt kê phần tử", "số chẵn"],
    content: t`Viết tập hợp $M$ các số tự nhiên chẵn nhỏ hơn $12$.`,
    answer: t`$M = \{0; 2; 4; 6; 8; 10\}$`,
    solution: t`Số tự nhiên chẵn là số chia hết cho $2$. Các số chẵn nhỏ hơn $12$ là $0, 2, 4, 6, 8, 10$.

Vậy $M = \{0; 2; 4; 6; 8; 10\}$.`,
    verify: () => sameList(range(0, 11).filter((x) => x % 2 === 0), [0, 2, 4, 6, 8, 10]),
  },
  {
    topic: `${C}/tap-hop`, difficulty: "APPLIED", type: "ESSAY", tags: ["tính chất đặc trưng"],
    content: t`Cho tập hợp $C = \{x \in \mathbb{N} \mid 5 \le x < 11\}$. Viết tập hợp $C$ bằng cách liệt kê các phần tử. Tập hợp $C$ có bao nhiêu phần tử?`,
    answer: t`$C = \{5; 6; 7; 8; 9; 10\}$, có $6$ phần tử.`,
    solution: t`Các số tự nhiên $x$ thỏa mãn $5 \le x < 11$ là $5, 6, 7, 8, 9, 10$ (có lấy $5$, không lấy $11$).

Vậy $C = \{5; 6; 7; 8; 9; 10\}$ và $C$ có $6$ phần tử.`,
    verify: () => {
      const c = range(0, 20).filter((x) => x >= 5 && x < 11);
      return sameList(c, [5, 6, 7, 8, 9, 10]) && c.length === 6;
    },
  },
  {
    topic: `${C}/tap-hop`, difficulty: "APPLIED", type: "SINGLE_CHOICE", tags: ["N*"],
    content: t`Tập hợp $D = \{x \in \mathbb{N}^* \mid x \le 4\}$ được viết bằng cách liệt kê là:`,
    options: [
      { label: "A", content: t`$\{0; 1; 2; 3; 4\}$` },
      { label: "B", content: t`$\{1; 2; 3; 4\}$`, correct: true },
      { label: "C", content: t`$\{1; 2; 3\}$` },
      { label: "D", content: t`$\{0; 1; 2; 3\}$` },
    ],
    answer: t`**B.** $\{1; 2; 3; 4\}$`,
    solution: t`$\mathbb{N}^*$ là tập hợp các số tự nhiên khác $0$, nên $x \in \{1; 2; 3; \dots\}$. Điều kiện $x \le 4$ cho $x \in \{1; 2; 3; 4\}$.`,
    verify: () => sameList(range(1, 20).filter((x) => x <= 4), [1, 2, 3, 4]),
  },
  {
    topic: `${C}/tap-hop`, difficulty: "ADVANCED", type: "ESSAY", tags: ["đếm phần tử"],
    content: t`Tập hợp các số tự nhiên có hai chữ số và chia hết cho $5$ có bao nhiêu phần tử?`,
    answer: t`$18$ phần tử.`,
    solution: t`Các số tự nhiên có hai chữ số chia hết cho $5$ là $10, 15, 20, \dots, 95$.

Đây là dãy số cách đều $5$ đơn vị, số phần tử là $(95 - 10) : 5 + 1 = 17 + 1 = 18$.`,
    verify: () => range(10, 99).filter((x) => x % 5 === 0).length === 18,
  },
  {
    topic: `${C}/tap-hop`, difficulty: "ADVANCED", type: "SHORT_ANSWER", tags: ["đếm phần tử", "chữ số"],
    content: t`Có bao nhiêu số tự nhiên có hai chữ số mà chữ số hàng chục lớn hơn chữ số hàng đơn vị đúng $3$ đơn vị?`,
    answer: t`$7$ số.`,
    solution: t`Gọi chữ số hàng đơn vị là $b$ thì chữ số hàng chục là $b + 3$. Vì $b + 3 \le 9$ nên $b \in \{0; 1; 2; 3; 4; 5; 6\}$.

Các số đó là $30, 41, 52, 63, 74, 85, 96$. Có $7$ số.`,
    verify: () => range(10, 99).filter((n) => Math.floor(n / 10) - (n % 10) === 3).length === 7,
  },

  // ── Đọc, viết, so sánh số tự nhiên ──
  {
    topic: `${C}/doc-viet-so-sanh-so-tu-nhien`, difficulty: "BASIC", type: "ESSAY", tags: ["viết số"],
    content: t`Viết số tự nhiên gồm: $5$ triệu, $3$ trăm nghìn, $7$ nghìn và $2$ chục.`,
    answer: t`$5\,307\,020$`,
    solution: t`$5 \cdot 1\,000\,000 + 3 \cdot 100\,000 + 7 \cdot 1\,000 + 2 \cdot 10 = 5\,307\,020$.

Chú ý các hàng không được nhắc đến (chục nghìn, trăm, đơn vị) có chữ số $0$.`,
    verify: () => 5 * 1_000_000 + 3 * 100_000 + 7 * 1_000 + 2 * 10 === 5_307_020,
  },
  {
    topic: `${C}/doc-viet-so-sanh-so-tu-nhien`, difficulty: "BASIC", type: "SINGLE_CHOICE", tags: ["số La Mã"],
    content: t`Số La Mã $\text{XIV}$ có giá trị là:`,
    options: [
      { label: "A", content: t`$16$` },
      { label: "B", content: t`$14$`, correct: true },
      { label: "C", content: t`$9$` },
      { label: "D", content: t`$114$` },
    ],
    answer: t`**B.** $14$`,
    solution: t`$\text{XIV} = \text{X} + \text{IV} = 10 + 4 = 14$.`,
    verify: () => toRoman(14) === "XIV",
  },
  {
    topic: `${C}/doc-viet-so-sanh-so-tu-nhien`, difficulty: "BASIC", type: "ESSAY", tags: ["so sánh"],
    content: t`Sắp xếp các số sau theo thứ tự tăng dần: $2\,019;\ 2\,109;\ 2\,091;\ 1\,992$.`,
    answer: t`$1\,992;\ 2\,019;\ 2\,091;\ 2\,109$`,
    solution: t`Các số đều có bốn chữ số. So sánh chữ số hàng nghìn: $1\,992$ nhỏ nhất.

Ba số còn lại cùng hàng nghìn là $2$, hàng trăm: $2\,019$ và $2\,091$ có chữ số $0$, $2\,109$ có chữ số $1$ nên $2\,109$ lớn nhất. So sánh hàng chục: $1 < 9$ nên $2\,019 < 2\,091$.

Thứ tự tăng dần: $1\,992;\ 2\,019;\ 2\,091;\ 2\,109$.`,
    verify: () => sameList([2019, 2109, 2091, 1992].sort((a, b) => a - b), [1992, 2019, 2091, 2109]),
  },
  {
    topic: `${C}/doc-viet-so-sanh-so-tu-nhien`, difficulty: "APPLIED", type: "SINGLE_CHOICE", tags: ["giá trị chữ số"],
    content: t`Trong số $4\,825\,173$, chữ số $8$ có giá trị là:`,
    options: [
      { label: "A", content: t`$8\,000$` },
      { label: "B", content: t`$80\,000$` },
      { label: "C", content: t`$800\,000$`, correct: true },
      { label: "D", content: t`$8\,000\,000$` },
    ],
    answer: t`**C.** $800\,000$`,
    solution: t`Trong số $4\,825\,173$: chữ số $4$ ở hàng triệu, chữ số $8$ ở hàng trăm nghìn. Vậy chữ số $8$ có giá trị $8 \cdot 100\,000 = 800\,000$.`,
    verify: () => Math.floor(4_825_173 / 100_000) % 10 === 8,
  },
  {
    topic: `${C}/doc-viet-so-sanh-so-tu-nhien`, difficulty: "APPLIED", type: "ESSAY", tags: ["số La Mã"],
    content: t`Viết các số $27$ và $19$ bằng số La Mã.`,
    answer: t`$27 = \text{XXVII}$; $\;19 = \text{XIX}$`,
    solution: t`- $27 = 10 + 10 + 5 + 1 + 1$ nên viết là $\text{XXVII}$.
- $19 = 10 + 9$, trong đó $9 = \text{IX}$, nên viết là $\text{XIX}$.`,
    verify: () => toRoman(27) === "XXVII" && toRoman(19) === "XIX",
  },
  {
    topic: `${C}/doc-viet-so-sanh-so-tu-nhien`, difficulty: "ADVANCED", type: "ESSAY", tags: ["lập số"],
    content: t`Dùng cả ba chữ số $0;\ 3;\ 7$, hãy viết tất cả các số tự nhiên có ba chữ số khác nhau. Tìm số lớn nhất và số nhỏ nhất trong các số đó.`,
    answer: t`Các số: $307;\ 370;\ 703;\ 730$. Lớn nhất $730$, nhỏ nhất $307$.`,
    solution: t`Chữ số hàng trăm phải khác $0$ nên là $3$ hoặc $7$.
- Hàng trăm là $3$: $307;\ 370$.
- Hàng trăm là $7$: $703;\ 730$.

Số lớn nhất là $730$, số nhỏ nhất là $307$.`,
    verify: () => {
      const nums = range(100, 999).filter((n) => {
        const d = String(n).split("").sort().join("");
        return d === "037";
      });
      return sameList(nums, [307, 370, 703, 730]);
    },
  },
  {
    topic: `${C}/doc-viet-so-sanh-so-tu-nhien`, difficulty: "ADVANCED", type: "SHORT_ANSWER", tags: ["so sánh", "số lẻ"],
    content: t`Tìm số tự nhiên lẻ $x$ thỏa mãn $2\,023 < x < 2\,026$.`,
    answer: t`$x = 2\,025$`,
    solution: t`Các số tự nhiên lớn hơn $2\,023$ và nhỏ hơn $2\,026$ là $2\,024$ và $2\,025$. Trong đó chỉ có $2\,025$ là số lẻ.`,
    verify: () => sameList(range(2024, 2025).filter((x) => x % 2 === 1), [2025]),
  },

  // ── Cộng, trừ, nhân, chia ──
  {
    topic: `${C}/cong-tru-nhan-chia`, difficulty: "BASIC", type: "ESSAY", tags: ["tính nhanh"],
    content: t`Tính nhanh: $37 + 128 + 63$.`,
    answer: t`$228$`,
    solution: t`$37 + 128 + 63 = (37 + 63) + 128 = 100 + 128 = 228$.`,
    verify: () => 37 + 128 + 63 === 228,
  },
  {
    topic: `${C}/cong-tru-nhan-chia`, difficulty: "BASIC", type: "ESSAY", tags: ["tính nhanh"],
    content: t`Tính nhanh: $25 \cdot 17 \cdot 4$.`,
    answer: t`$1\,700$`,
    solution: t`$25 \cdot 17 \cdot 4 = (25 \cdot 4) \cdot 17 = 100 \cdot 17 = 1\,700$.`,
    verify: () => 25 * 17 * 4 === 1700,
  },
  {
    topic: `${C}/cong-tru-nhan-chia`, difficulty: "BASIC", type: "SINGLE_CHOICE", tags: ["phép chia"],
    content: t`Kết quả của phép chia $1\,035 : 15$ là:`,
    options: [
      { label: "A", content: t`$69$`, correct: true },
      { label: "B", content: t`$79$` },
      { label: "C", content: t`$59$` },
      { label: "D", content: t`$67$` },
    ],
    answer: t`**A.** $69$`,
    solution: t`Đặt tính chia: $1\,035 : 15 = 69$. Thử lại: $15 \cdot 69 = 1\,035$.`,
    verify: () => 1035 / 15 === 69,
  },
  {
    topic: `${C}/cong-tru-nhan-chia`, difficulty: "APPLIED", type: "ESSAY", tags: ["tính chất phân phối"],
    content: t`Tính nhanh: $46 \cdot 37 + 46 \cdot 63$.`,
    answer: t`$4\,600$`,
    solution: t`Áp dụng tính chất phân phối của phép nhân đối với phép cộng:

$46 \cdot 37 + 46 \cdot 63 = 46 \cdot (37 + 63) = 46 \cdot 100 = 4\,600$.`,
    verify: () => 46 * 37 + 46 * 63 === 4600,
  },
  {
    topic: `${C}/cong-tru-nhan-chia`, difficulty: "APPLIED", type: "ESSAY", tags: ["phép chia có dư"],
    content: t`Tìm thương và số dư của phép chia $2\,026$ cho $13$.`,
    answer: t`Thương $155$, số dư $11$.`,
    solution: t`Thực hiện phép chia: $2\,026 = 13 \cdot 155 + 11$, với $0 \le 11 < 13$.

Vậy thương là $155$ và số dư là $11$.`,
    verify: () => Math.floor(2026 / 13) === 155 && 2026 % 13 === 11,
  },
  {
    topic: `${C}/cong-tru-nhan-chia`, difficulty: "APPLIED", type: "ESSAY", tags: ["bài toán thực tế"],
    content: t`Một trường có $18$ lớp, mỗi lớp có $35$ học sinh. Nhà trường thuê các xe $45$ chỗ (chỉ chở học sinh) để đưa toàn bộ học sinh đi tham quan. Cần ít nhất bao nhiêu xe?`,
    answer: t`$14$ xe.`,
    solution: t`Số học sinh của trường: $18 \cdot 35 = 630$ (học sinh).

$630 : 45 = 14$, phép chia hết nên cần ít nhất $14$ xe.`,
    verify: () => 18 * 35 === 630 && Math.ceil(630 / 45) === 14,
  },
  {
    topic: `${C}/cong-tru-nhan-chia`, difficulty: "ADVANCED", type: "ESSAY", tags: ["tổng dãy số"],
    content: t`Tính tổng $S = 1 + 2 + 3 + \dots + 100$.`,
    answer: t`$S = 5\,050$`,
    solution: t`Ghép các số hạng cách đều hai đầu thành từng cặp: $(1 + 100) + (2 + 99) + \dots + (50 + 51)$.

Có $50$ cặp, mỗi cặp có tổng $101$. Vậy $S = 50 \cdot 101 = 5\,050$.`,
    verify: () => range(1, 100).reduce((s, x) => s + x, 0) === 5050,
  },
  {
    topic: `${C}/cong-tru-nhan-chia`, difficulty: "ADVANCED", type: "ESSAY", tags: ["tổng dãy số", "số lẻ"],
    content: t`Tính tổng các số tự nhiên lẻ từ $1$ đến $99$: $\;T = 1 + 3 + 5 + \dots + 99$.`,
    answer: t`$T = 2\,500$`,
    solution: t`Số số hạng: $(99 - 1) : 2 + 1 = 50$.

Ghép cặp các số hạng cách đều hai đầu: $(1 + 99) + (3 + 97) + \dots$, có $25$ cặp, mỗi cặp có tổng $100$.

Vậy $T = 25 \cdot 100 = 2\,500$.`,
    verify: () => range(1, 99).filter((x) => x % 2 === 1).reduce((s, x) => s + x, 0) === 2500,
  },
  {
    topic: `${C}/cong-tru-nhan-chia`, difficulty: "ADVANCED", type: "SHORT_ANSWER", tags: ["tính nhanh"],
    content: t`Tính nhanh: $999 \cdot 25 + 25$.`,
    answer: t`$25\,000$`,
    solution: t`$999 \cdot 25 + 25 = 999 \cdot 25 + 1 \cdot 25 = (999 + 1) \cdot 25 = 1\,000 \cdot 25 = 25\,000$.`,
    verify: () => 999 * 25 + 25 === 25000,
  },

  // ── Lũy thừa ──
  {
    topic: `${C}/luy-thua`, difficulty: "BASIC", type: "ESSAY", tags: ["tính lũy thừa"],
    content: t`Tính: $2^5$; $\;3^4$; $\;10^3$.`,
    answer: t`$2^5 = 32$; $\;3^4 = 81$; $\;10^3 = 1\,000$.`,
    solution: t`- $2^5 = 2 \cdot 2 \cdot 2 \cdot 2 \cdot 2 = 32$.
- $3^4 = 3 \cdot 3 \cdot 3 \cdot 3 = 81$.
- $10^3 = 10 \cdot 10 \cdot 10 = 1\,000$.`,
    verify: () => 2 ** 5 === 32 && 3 ** 4 === 81 && 10 ** 3 === 1000,
  },
  {
    topic: `${C}/luy-thua`, difficulty: "BASIC", type: "SINGLE_CHOICE", tags: ["viết dạng lũy thừa"],
    content: t`Tích $7 \cdot 7 \cdot 7 \cdot 7$ được viết dưới dạng lũy thừa là:`,
    options: [
      { label: "A", content: t`$7^4$`, correct: true },
      { label: "B", content: t`$4^7$` },
      { label: "C", content: t`$7 \cdot 4$` },
      { label: "D", content: t`$28$` },
    ],
    answer: t`**A.** $7^4$`,
    solution: t`Tích của $4$ thừa số bằng nhau, mỗi thừa số bằng $7$, được viết là $7^4$ (cơ số $7$, số mũ $4$).`,
    verify: () => 7 ** 4 === 7 * 7 * 7 * 7 && 4 ** 7 !== 7 ** 4,
  },
  {
    topic: `${C}/luy-thua`, difficulty: "BASIC", type: "ESSAY", tags: ["nhân hai lũy thừa cùng cơ số"],
    content: t`Viết kết quả phép tính dưới dạng một lũy thừa: $5^3 \cdot 5^4$.`,
    answer: t`$5^7$`,
    solution: t`Nhân hai lũy thừa cùng cơ số, ta giữ nguyên cơ số và cộng các số mũ: $5^3 \cdot 5^4 = 5^{3+4} = 5^7$.`,
    verify: () => 5 ** 3 * 5 ** 4 === 5 ** 7,
  },
  {
    topic: `${C}/luy-thua`, difficulty: "APPLIED", type: "ESSAY", tags: ["chia hai lũy thừa cùng cơ số"],
    content: t`Viết kết quả phép tính $3^{10} : 3^6$ dưới dạng một lũy thừa rồi tính giá trị.`,
    answer: t`$3^4 = 81$`,
    solution: t`Chia hai lũy thừa cùng cơ số, ta giữ nguyên cơ số và trừ các số mũ: $3^{10} : 3^6 = 3^{10-6} = 3^4 = 81$.`,
    verify: () => 3 ** 10 / 3 ** 6 === 81 && 3 ** 4 === 81,
  },
  {
    topic: `${C}/luy-thua`, difficulty: "APPLIED", type: "SINGLE_CHOICE", tags: ["so sánh lũy thừa"],
    content: t`So sánh $2^5$ và $5^2$.`,
    options: [
      { label: "A", content: t`$2^5 > 5^2$`, correct: true },
      { label: "B", content: t`$2^5 < 5^2$` },
      { label: "C", content: t`$2^5 = 5^2$` },
      { label: "D", content: t`Không so sánh được` },
    ],
    answer: t`**A.** $2^5 > 5^2$`,
    solution: t`$2^5 = 32$ và $5^2 = 25$. Vì $32 > 25$ nên $2^5 > 5^2$.`,
    verify: () => 2 ** 5 > 5 ** 2,
  },
  {
    topic: `${C}/luy-thua`, difficulty: "APPLIED", type: "ESSAY", tags: ["lũy thừa của 10"],
    content: t`Viết các số $1\,000\,000$ và $10\,000$ dưới dạng lũy thừa của $10$.`,
    answer: t`$1\,000\,000 = 10^6$; $\;10\,000 = 10^4$.`,
    solution: t`Lũy thừa $10^n$ là số gồm chữ số $1$ và $n$ chữ số $0$ đứng sau.
- $1\,000\,000$ có $6$ chữ số $0$ nên bằng $10^6$.
- $10\,000$ có $4$ chữ số $0$ nên bằng $10^4$.`,
    verify: () => 10 ** 6 === 1_000_000 && 10 ** 4 === 10_000,
  },
  {
    topic: `${C}/luy-thua`, difficulty: "ADVANCED", type: "ESSAY", tags: ["tìm số mũ"],
    content: t`Tìm số tự nhiên $n$, biết $2^n = 64$.`,
    answer: t`$n = 6$`,
    solution: t`Ta có $64 = 2 \cdot 2 \cdot 2 \cdot 2 \cdot 2 \cdot 2 = 2^6$.

Vậy $2^n = 2^6$, suy ra $n = 6$.`,
    verify: () => range(0, 20).filter((n) => 2 ** n === 64)[0] === 6,
  },
  {
    topic: `${C}/luy-thua`, difficulty: "ADVANCED", type: "ESSAY", tags: ["tìm số mũ"],
    content: t`Tìm số tự nhiên $n$, biết $3^n \cdot 3 = 243$.`,
    answer: t`$n = 4$`,
    solution: t`$3^n \cdot 3 = 3^{n+1}$ và $243 = 3^5$.

Do đó $3^{n+1} = 3^5$, suy ra $n + 1 = 5$, nên $n = 4$.`,
    verify: () => 3 ** 5 === 243 && 3 ** 4 * 3 === 243,
  },
  {
    topic: `${C}/luy-thua`, difficulty: "ADVANCED", type: "SHORT_ANSWER", tags: ["chữ số tận cùng"],
    content: t`Tìm chữ số tận cùng của $2^{10}$.`,
    answer: t`$4$`,
    solution: t`$2^{10} = 2^5 \cdot 2^5 = 32 \cdot 32 = 1\,024$. Chữ số tận cùng là $4$.`,
    verify: () => 2 ** 10 === 1024 && (2 ** 10) % 10 === 4,
  },

  // ── Thứ tự thực hiện phép tính ──
  {
    topic: `${C}/thu-tu-thuc-hien-phep-tinh`, difficulty: "BASIC", type: "ESSAY", tags: ["không ngoặc"],
    content: t`Tính: $48 - 32 : 8$.`,
    answer: t`$44$`,
    solution: t`Thực hiện phép chia trước, phép trừ sau: $48 - 32 : 8 = 48 - 4 = 44$.`,
    verify: () => 48 - 32 / 8 === 44,
  },
  {
    topic: `${C}/thu-tu-thuc-hien-phep-tinh`, difficulty: "BASIC", type: "ESSAY", tags: ["lũy thừa", "không ngoặc"],
    content: t`Tính: $5 \cdot 2^3 - 18 : 3^2$.`,
    answer: t`$38$`,
    solution: t`Tính lũy thừa trước: $5 \cdot 8 - 18 : 9$.

Tiếp theo nhân, chia: $40 - 2$.

Cuối cùng: $40 - 2 = 38$.`,
    verify: () => 5 * 2 ** 3 - 18 / 3 ** 2 === 38,
  },
  {
    topic: `${C}/thu-tu-thuc-hien-phep-tinh`, difficulty: "BASIC", type: "SINGLE_CHOICE", tags: ["có ngoặc"],
    content: t`Giá trị của biểu thức $(15 + 25) : 5 \cdot 2$ là:`,
    options: [
      { label: "A", content: t`$4$` },
      { label: "B", content: t`$16$`, correct: true },
      { label: "C", content: t`$8$` },
      { label: "D", content: t`$20$` },
    ],
    answer: t`**B.** $16$`,
    solution: t`Tính trong ngoặc trước: $15 + 25 = 40$.

Phép chia và phép nhân thực hiện từ trái sang phải: $40 : 5 \cdot 2 = 8 \cdot 2 = 16$.`,
    verify: () => ((15 + 25) / 5) * 2 === 16,
  },
  {
    topic: `${C}/thu-tu-thuc-hien-phep-tinh`, difficulty: "APPLIED", type: "ESSAY", tags: ["ngoặc vuông"],
    content: t`Tính: $80 - [130 - (12 - 4)^2]$.`,
    answer: t`$14$`,
    solution: t`$80 - [130 - (12 - 4)^2] = 80 - [130 - 8^2]$

$= 80 - [130 - 64] = 80 - 66 = 14$.`,
    verify: () => 80 - (130 - (12 - 4) ** 2) === 14,
  },
  {
    topic: `${C}/thu-tu-thuc-hien-phep-tinh`, difficulty: "APPLIED", type: "ESSAY", tags: ["tính chất phân phối"],
    content: t`Tính hợp lí: $2^3 \cdot 17 - 2^3 \cdot 14$.`,
    answer: t`$24$`,
    solution: t`$2^3 \cdot 17 - 2^3 \cdot 14 = 2^3 \cdot (17 - 14) = 8 \cdot 3 = 24$.`,
    verify: () => 2 ** 3 * 17 - 2 ** 3 * 14 === 24,
  },
  {
    topic: `${C}/thu-tu-thuc-hien-phep-tinh`, difficulty: "APPLIED", type: "ESSAY", tags: ["ngoặc nhọn"],
    content: t`Tính: $72 : \{2 \cdot [25 - (3 \cdot 4 + 1)]\}$.`,
    answer: t`$3$`,
    solution: t`Tính trong ngoặc tròn: $3 \cdot 4 + 1 = 13$.

Ngoặc vuông: $25 - 13 = 12$.

Ngoặc nhọn: $2 \cdot 12 = 24$.

Kết quả: $72 : 24 = 3$.`,
    verify: () => 72 / (2 * (25 - (3 * 4 + 1))) === 3,
  },
  {
    topic: `${C}/thu-tu-thuc-hien-phep-tinh`, difficulty: "ADVANCED", type: "ESSAY", tags: ["ngoặc nhọn", "lũy thừa"],
    content: t`Tính: $\{[(2^4 - 6) \cdot 3 + 10] : 8\} \cdot 2^2$.`,
    answer: t`$20$`,
    solution: t`- $2^4 - 6 = 16 - 6 = 10$.
- $10 \cdot 3 + 10 = 40$.
- $40 : 8 = 5$.
- $5 \cdot 2^2 = 5 \cdot 4 = 20$.`,
    verify: () => (((2 ** 4 - 6) * 3 + 10) / 8) * 2 ** 2 === 20,
  },
  {
    topic: `${C}/thu-tu-thuc-hien-phep-tinh`, difficulty: "ADVANCED", type: "SHORT_ANSWER", tags: ["ngoặc vuông", "lũy thừa"],
    content: t`Tính: $1\,000 - 10 \cdot [5^2 + 2 \cdot (19 - 4)]$.`,
    answer: t`$450$`,
    solution: t`$1\,000 - 10 \cdot [25 + 2 \cdot 15] = 1\,000 - 10 \cdot [25 + 30]$

$= 1\,000 - 10 \cdot 55 = 1\,000 - 550 = 450$.`,
    verify: () => 1000 - 10 * (5 ** 2 + 2 * (19 - 4)) === 450,
  },

  // ── Tìm x ──
  {
    topic: `${C}/tim-x`, difficulty: "BASIC", type: "ESSAY", tags: ["tìm số hạng"],
    content: t`Tìm số tự nhiên $x$, biết: $x + 37 = 105$.`,
    answer: t`$x = 68$`,
    solution: t`$x$ là số hạng chưa biết: $x = 105 - 37 = 68$.`,
    verify: () => 68 + 37 === 105,
  },
  {
    topic: `${C}/tim-x`, difficulty: "BASIC", type: "ESSAY", tags: ["tìm thừa số"],
    content: t`Tìm số tự nhiên $x$, biết: $5 \cdot x = 135$.`,
    answer: t`$x = 27$`,
    solution: t`$x$ là thừa số chưa biết: $x = 135 : 5 = 27$.`,
    verify: () => 5 * 27 === 135,
  },
  {
    topic: `${C}/tim-x`, difficulty: "BASIC", type: "SINGLE_CHOICE", tags: ["tìm số bị trừ"],
    content: t`Số tự nhiên $x$ thỏa mãn $x - 24 = 56$ là:`,
    options: [
      { label: "A", content: t`$32$` },
      { label: "B", content: t`$80$`, correct: true },
      { label: "C", content: t`$72$` },
      { label: "D", content: t`$90$` },
    ],
    answer: t`**B.** $80$`,
    solution: t`$x$ là số bị trừ: $x = 56 + 24 = 80$.`,
    verify: () => 80 - 24 === 56,
  },
  {
    topic: `${C}/tim-x`, difficulty: "APPLIED", type: "ESSAY", tags: ["hai bước"],
    content: t`Tìm số tự nhiên $x$, biết: $3x - 15 = 42$.`,
    answer: t`$x = 19$`,
    solution: t`$3x = 42 + 15 = 57$.

$x = 57 : 3 = 19$.`,
    verify: () => 3 * 19 - 15 === 42,
  },
  {
    topic: `${C}/tim-x`, difficulty: "APPLIED", type: "ESSAY", tags: ["hai bước"],
    content: t`Tìm số tự nhiên $x$, biết: $(x - 12) : 4 = 9$.`,
    answer: t`$x = 48$`,
    solution: t`$x - 12 = 9 \cdot 4 = 36$.

$x = 36 + 12 = 48$.`,
    verify: () => (48 - 12) / 4 === 9,
  },
  {
    topic: `${C}/tim-x`, difficulty: "APPLIED", type: "ESSAY", tags: ["lũy thừa"],
    content: t`Tìm số tự nhiên $x$, biết: $2^x = 32$.`,
    answer: t`$x = 5$`,
    solution: t`$32 = 2^5$ nên $2^x = 2^5$, suy ra $x = 5$.`,
    verify: () => 2 ** 5 === 32,
  },
  {
    topic: `${C}/tim-x`, difficulty: "ADVANCED", type: "ESSAY", tags: ["lũy thừa"],
    content: t`Tìm số tự nhiên $x$, biết: $3^{x+1} = 81$.`,
    answer: t`$x = 3$`,
    solution: t`$81 = 3^4$ nên $3^{x+1} = 3^4$.

Suy ra $x + 1 = 4$, do đó $x = 3$.`,
    verify: () => 3 ** (3 + 1) === 81,
  },
  {
    topic: `${C}/tim-x`, difficulty: "ADVANCED", type: "ESSAY", tags: ["tìm số chia"],
    content: t`Tìm số tự nhiên $x$, biết: $140 : (x - 8) = 7$.`,
    answer: t`$x = 28$`,
    solution: t`$x - 8$ là số chia: $x - 8 = 140 : 7 = 20$.

$x = 20 + 8 = 28$.`,
    verify: () => 140 / (28 - 8) === 7,
  },
  {
    topic: `${C}/tim-x`, difficulty: "ADVANCED", type: "SHORT_ANSWER", tags: ["tính chất phân phối"],
    content: t`Tìm số tự nhiên $x$, biết: $2 \cdot x + 3 \cdot x = 125$.`,
    answer: t`$x = 25$`,
    solution: t`$2 \cdot x + 3 \cdot x = (2 + 3) \cdot x = 5 \cdot x$.

$5 \cdot x = 125$ nên $x = 125 : 5 = 25$.`,
    verify: () => 2 * 25 + 3 * 25 === 125,
  },
];
