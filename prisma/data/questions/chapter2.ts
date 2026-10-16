import type { SeedQuestion } from "../types";
import { digitSum, divisors, factorize, gcd, gcdMany, isPrime, lcm, lcmMany, range, sameFactorization, sameList } from "../verify";

const t = String.raw;
const C = "tinh-chia-het-trong-tap-hop-so-tu-nhien";

export const CHAPTER_2_QUESTIONS: SeedQuestion[] = [
  // ── Dấu hiệu chia hết ──
  {
    topic: `${C}/dau-hieu-chia-het`, difficulty: "BASIC", type: "ESSAY", tags: ["chia hết cho 2", "chia hết cho 5"],
    content: t`Trong các số $1\,234;\ 3\,105;\ 4\,770;\ 5\,931$, số nào chia hết cho $2$? Số nào chia hết cho $5$?`,
    answer: t`Chia hết cho $2$: $1\,234;\ 4\,770$. Chia hết cho $5$: $3\,105;\ 4\,770$.`,
    solution: t`- Số chia hết cho $2$ có chữ số tận cùng là chữ số chẵn: $1\,234$ (tận cùng $4$) và $4\,770$ (tận cùng $0$).
- Số chia hết cho $5$ có chữ số tận cùng là $0$ hoặc $5$: $3\,105$ và $4\,770$.`,
    verify: () => {
      const xs = [1234, 3105, 4770, 5931];
      return sameList(xs.filter((x) => x % 2 === 0), [1234, 4770]) && sameList(xs.filter((x) => x % 5 === 0), [3105, 4770]);
    },
  },
  {
    topic: `${C}/dau-hieu-chia-het`, difficulty: "BASIC", type: "SINGLE_CHOICE", tags: ["chia hết cho 9"],
    content: t`Số nào sau đây chia hết cho $9$?`,
    options: [
      { label: "A", content: t`$1\,236$` },
      { label: "B", content: t`$4\,518$`, correct: true },
      { label: "C", content: t`$7\,102$` },
      { label: "D", content: t`$8\,101$` },
    ],
    answer: t`**B.** $4\,518$`,
    solution: t`Tính tổng các chữ số:
- $1 + 2 + 3 + 6 = 12$, không chia hết cho $9$.
- $4 + 5 + 1 + 8 = 18$, chia hết cho $9$.
- $7 + 1 + 0 + 2 = 10$ và $8 + 1 + 0 + 1 = 10$, không chia hết cho $9$.

Vậy chỉ có $4\,518$ chia hết cho $9$.`,
    verify: () => sameList([1236, 4518, 7102, 8101].filter((x) => x % 9 === 0), [4518]),
  },
  {
    topic: `${C}/dau-hieu-chia-het`, difficulty: "BASIC", type: "ESSAY", tags: ["điền chữ số"],
    content: t`Thay dấu $*$ bằng chữ số thích hợp để số $\overline{35*}$ chia hết cho $5$.`,
    answer: t`$* \in \{0; 5\}$, ta được các số $350$ và $355$.`,
    solution: t`Số chia hết cho $5$ khi chữ số tận cùng là $0$ hoặc $5$. Do đó $* \in \{0; 5\}$.`,
    verify: () => sameList(range(0, 9).filter((d) => (350 + d) % 5 === 0), [0, 5]),
  },
  {
    topic: `${C}/dau-hieu-chia-het`, difficulty: "APPLIED", type: "ESSAY", tags: ["điền chữ số", "chia hết cho 3"],
    content: t`Thay dấu $*$ bằng chữ số thích hợp để số $\overline{4*2}$ chia hết cho $3$.`,
    answer: t`$* \in \{0; 3; 6; 9\}$`,
    solution: t`Tổng các chữ số là $4 + * + 2 = 6 + *$. Để số chia hết cho $3$ thì $6 + *$ chia hết cho $3$, tức là $*$ chia hết cho $3$.

Vậy $* \in \{0; 3; 6; 9\}$, ta được các số $402;\ 432;\ 462;\ 492$.`,
    verify: () => sameList(range(0, 9).filter((d) => (400 + d * 10 + 2) % 3 === 0), [0, 3, 6, 9]),
  },
  {
    topic: `${C}/dau-hieu-chia-het`, difficulty: "APPLIED", type: "ESSAY", tags: ["điền chữ số", "chia hết cho 9"],
    content: t`Tìm chữ số $a$ để số $\overline{7a5}$ chia hết cho $9$.`,
    answer: t`$a = 6$`,
    solution: t`Tổng các chữ số: $7 + a + 5 = 12 + a$. Vì $0 \le a \le 9$ nên $12 \le 12 + a \le 21$.

Số chia hết cho $9$ trong khoảng này là $18$, nên $12 + a = 18$, suy ra $a = 6$. Ta được số $765$.`,
    verify: () => sameList(range(0, 9).filter((a) => (705 + a * 10) % 9 === 0), [6]),
  },
  {
    topic: `${C}/dau-hieu-chia-het`, difficulty: "APPLIED", type: "SINGLE_CHOICE", tags: ["chia hết cho 2 và 5"],
    content: t`Số $\overline{23a}$ chia hết cho cả $2$ và $5$ khi chữ số $a$ bằng:`,
    options: [
      { label: "A", content: t`$0$`, correct: true },
      { label: "B", content: t`$5$` },
      { label: "C", content: t`$2$` },
      { label: "D", content: t`$3$` },
    ],
    answer: t`**A.** $0$`,
    solution: t`Số chia hết cho cả $2$ và $5$ khi có chữ số tận cùng là $0$. Vậy $a = 0$.`,
    verify: () => sameList(range(0, 9).filter((a) => (230 + a) % 10 === 0), [0]),
  },
  {
    topic: `${C}/dau-hieu-chia-het`, difficulty: "ADVANCED", type: "ESSAY", tags: ["điền chữ số", "chia hết cho 2, 3, 5, 9"],
    content: t`Tìm các chữ số $a$ và $b$ để số $\overline{a63b}$ chia hết cho cả $2;\ 3;\ 5$ và $9$.`,
    answer: t`$a = 9$, $b = 0$; ta được số $9\,630$.`,
    solution: t`Số chia hết cho cả $2$ và $5$ nên $b = 0$.

Số chia hết cho $9$ (khi đó cũng chia hết cho $3$) nên $a + 6 + 3 + 0 = a + 9$ chia hết cho $9$. Vì $a$ là chữ số hàng nghìn nên $1 \le a \le 9$, suy ra $a = 9$.

Vậy số cần tìm là $9\,630$.`,
    verify: () => {
      const found: number[] = [];
      for (const a of range(1, 9)) for (const b of range(0, 9)) {
        const n = a * 1000 + 630 + b;
        if (n % 2 === 0 && n % 3 === 0 && n % 5 === 0 && n % 9 === 0) found.push(n);
      }
      return sameList(found, [9630]);
    },
  },
  {
    topic: `${C}/dau-hieu-chia-het`, difficulty: "ADVANCED", type: "ESSAY", tags: ["tính chất chia hết của tổng"],
    content: t`Không thực hiện phép cộng, hãy cho biết tổng $1\,251 + 5\,316$ có chia hết cho $3$ hay không. Giải thích.`,
    answer: t`Có, tổng chia hết cho $3$.`,
    solution: t`- $1\,251$ có tổng các chữ số $1 + 2 + 5 + 1 = 9$ nên chia hết cho $3$.
- $5\,316$ có tổng các chữ số $5 + 3 + 1 + 6 = 15$ nên chia hết cho $3$.

Mỗi số hạng đều chia hết cho $3$ nên tổng chia hết cho $3$.`,
    verify: () => digitSum(1251) % 3 === 0 && digitSum(5316) % 3 === 0 && (1251 + 5316) % 3 === 0,
  },
  {
    topic: `${C}/dau-hieu-chia-het`, difficulty: "ADVANCED", type: "SHORT_ANSWER", tags: ["đếm", "chia hết cho 9"],
    content: t`Có bao nhiêu số tự nhiên có ba chữ số chia hết cho $9$?`,
    answer: t`$100$ số.`,
    solution: t`Số có ba chữ số nhỏ nhất chia hết cho $9$ là $108$, lớn nhất là $999$.

Các số đó cách đều nhau $9$ đơn vị, nên số lượng là $(999 - 108) : 9 + 1 = 99 + 1 = 100$.`,
    verify: () => range(100, 999).filter((x) => x % 9 === 0).length === 100,
  },

  // ── Ước và bội ──
  {
    topic: `${C}/uoc-va-boi`, difficulty: "BASIC", type: "ESSAY", tags: ["tìm ước"],
    content: t`Tìm tập hợp $\text{Ư}(18)$ các ước của $18$.`,
    answer: t`$\text{Ư}(18) = \{1; 2; 3; 6; 9; 18\}$`,
    solution: t`Lần lượt chia $18$ cho $1, 2, 3, \dots, 18$, ta thấy $18$ chia hết cho $1, 2, 3, 6, 9, 18$.

Vậy $\text{Ư}(18) = \{1; 2; 3; 6; 9; 18\}$.`,
    verify: () => sameList(divisors(18), [1, 2, 3, 6, 9, 18]),
  },
  {
    topic: `${C}/uoc-va-boi`, difficulty: "BASIC", type: "ESSAY", tags: ["tìm bội"],
    content: t`Viết tập hợp các bội của $7$ nhỏ hơn $50$.`,
    answer: t`$\{0; 7; 14; 21; 28; 35; 42; 49\}$`,
    solution: t`Nhân $7$ lần lượt với $0, 1, 2, \dots$: $0, 7, 14, 21, 28, 35, 42, 49, 56, \dots$

Các bội nhỏ hơn $50$ là $0; 7; 14; 21; 28; 35; 42; 49$.`,
    verify: () => sameList(range(0, 49).filter((x) => x % 7 === 0), [0, 7, 14, 21, 28, 35, 42, 49]),
  },
  {
    topic: `${C}/uoc-va-boi`, difficulty: "BASIC", type: "SINGLE_CHOICE", tags: ["nhận biết ước"],
    content: t`Số nào sau đây là ước của $24$?`,
    options: [
      { label: "A", content: t`$5$` },
      { label: "B", content: t`$7$` },
      { label: "C", content: t`$8$`, correct: true },
      { label: "D", content: t`$9$` },
    ],
    answer: t`**C.** $8$`,
    solution: t`$24 = 8 \cdot 3$ nên $24$ chia hết cho $8$. Các số $5, 7, 9$ đều không là ước của $24$.`,
    verify: () => sameList([5, 7, 8, 9].filter((d) => 24 % d === 0), [8]),
  },
  {
    topic: `${C}/uoc-va-boi`, difficulty: "APPLIED", type: "ESSAY", tags: ["tìm bội trong khoảng"],
    content: t`Tìm các số tự nhiên $x$ sao cho $x \in \text{B}(12)$ và $20 \le x \le 50$.`,
    answer: t`$x \in \{24; 36; 48\}$`,
    solution: t`$\text{B}(12) = \{0; 12; 24; 36; 48; 60; \dots\}$.

Các bội thỏa mãn $20 \le x \le 50$ là $24;\ 36;\ 48$.`,
    verify: () => sameList(range(20, 50).filter((x) => x % 12 === 0), [24, 36, 48]),
  },
  {
    topic: `${C}/uoc-va-boi`, difficulty: "APPLIED", type: "ESSAY", tags: ["bài toán thực tế", "ước"],
    content: t`Có $30$ quyển vở cần chia đều vào các túi sao cho có ít nhất $2$ túi và mỗi túi có ít nhất $2$ quyển. Có bao nhiêu cách chia? Nêu số túi trong mỗi cách.`,
    answer: t`Có $6$ cách: $2;\ 3;\ 5;\ 6;\ 10;\ 15$ túi.`,
    solution: t`Số túi phải là ước của $30$: $\text{Ư}(30) = \{1; 2; 3; 5; 6; 10; 15; 30\}$.

Có ít nhất $2$ túi nên loại $1$; mỗi túi ít nhất $2$ quyển nên số túi không quá $15$, loại $30$.

Vậy số túi có thể là $2;\ 3;\ 5;\ 6;\ 10;\ 15$ — có $6$ cách chia.`,
    verify: () => sameList(divisors(30).filter((d) => d >= 2 && 30 / d >= 2), [2, 3, 5, 6, 10, 15]),
  },
  {
    topic: `${C}/uoc-va-boi`, difficulty: "ADVANCED", type: "ESSAY", tags: ["chia hết", "tìm n"],
    content: t`Tìm số tự nhiên $n$ sao cho $n + 3$ chia hết cho $n + 1$.`,
    answer: t`$n \in \{0; 1\}$`,
    solution: t`Ta có $n + 3 = (n + 1) + 2$. Vì $n + 1$ chia hết cho $n + 1$ nên để $n + 3$ chia hết cho $n + 1$ thì $2$ phải chia hết cho $n + 1$.

Suy ra $n + 1 \in \text{Ư}(2) = \{1; 2\}$, nên $n \in \{0; 1\}$.`,
    verify: () => sameList(range(0, 200).filter((n) => (n + 3) % (n + 1) === 0), [0, 1]),
  },
  {
    topic: `${C}/uoc-va-boi`, difficulty: "ADVANCED", type: "SHORT_ANSWER", tags: ["đếm ước"],
    content: t`Số $36$ có bao nhiêu ước?`,
    answer: t`$9$ ước.`,
    solution: t`$\text{Ư}(36) = \{1; 2; 3; 4; 6; 9; 12; 18; 36\}$. Vậy $36$ có $9$ ước.`,
    verify: () => divisors(36).length === 9,
  },

  // ── Số nguyên tố ──
  {
    topic: `${C}/so-nguyen-to`, difficulty: "BASIC", type: "ESSAY", tags: ["nhận biết"],
    content: t`Trong các số $2;\ 9;\ 13;\ 21;\ 29;\ 51$, số nào là số nguyên tố, số nào là hợp số?`,
    answer: t`Số nguyên tố: $2;\ 13;\ 29$. Hợp số: $9;\ 21;\ 51$.`,
    solution: t`- $2, 13, 29$ chỉ có hai ước là $1$ và chính nó nên là số nguyên tố.
- $9 = 3 \cdot 3$, $21 = 3 \cdot 7$, $51 = 3 \cdot 17$ đều có nhiều hơn hai ước nên là hợp số.`,
    verify: () => {
      const xs = [2, 9, 13, 21, 29, 51];
      return sameList(xs.filter(isPrime), [2, 13, 29]) && sameList(xs.filter((x) => !isPrime(x)), [9, 21, 51]);
    },
  },
  {
    topic: `${C}/so-nguyen-to`, difficulty: "BASIC", type: "SINGLE_CHOICE", tags: ["nhận biết"],
    content: t`Số nào sau đây là số nguyên tố?`,
    options: [
      { label: "A", content: t`$1$` },
      { label: "B", content: t`$27$` },
      { label: "C", content: t`$31$`, correct: true },
      { label: "D", content: t`$39$` },
    ],
    answer: t`**C.** $31$`,
    solution: t`- $1$ không là số nguyên tố.
- $27 = 3 \cdot 9$ và $39 = 3 \cdot 13$ là hợp số.
- $31$ chỉ có hai ước là $1$ và $31$ nên là số nguyên tố.`,
    verify: () => sameList([1, 27, 31, 39].filter(isPrime), [31]),
  },
  {
    topic: `${C}/so-nguyen-to`, difficulty: "BASIC", type: "ESSAY", tags: ["liệt kê"],
    content: t`Liệt kê các số nguyên tố nhỏ hơn $30$.`,
    answer: t`$2;\ 3;\ 5;\ 7;\ 11;\ 13;\ 17;\ 19;\ 23;\ 29$`,
    solution: t`Loại bỏ $0, 1$ và các bội của $2, 3, 5$ (trừ chính chúng), các số còn lại nhỏ hơn $30$ là:

$2;\ 3;\ 5;\ 7;\ 11;\ 13;\ 17;\ 19;\ 23;\ 29$ (có $10$ số).`,
    verify: () => sameList(range(0, 29).filter(isPrime), [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]),
  },
  {
    topic: `${C}/so-nguyen-to`, difficulty: "APPLIED", type: "ESSAY", tags: ["hợp số", "tính chất chia hết"],
    content: t`Tổng $3 \cdot 5 \cdot 7 + 11 \cdot 13$ là số nguyên tố hay hợp số? Vì sao?`,
    answer: t`Là hợp số.`,
    solution: t`$3 \cdot 5 \cdot 7 = 105$ là số lẻ và $11 \cdot 13 = 143$ là số lẻ. Tổng của hai số lẻ là số chẵn: $105 + 143 = 248$.

$248$ chia hết cho $2$ và lớn hơn $2$ nên có ít nhất ba ước $1, 2, 248$. Vậy tổng là hợp số.`,
    verify: () => 3 * 5 * 7 + 11 * 13 === 248 && !isPrime(248),
  },
  {
    topic: `${C}/so-nguyen-to`, difficulty: "APPLIED", type: "SINGLE_CHOICE", tags: ["khái niệm"],
    content: t`Khẳng định nào sau đây là **sai**?`,
    options: [
      { label: "A", content: t`Số $2$ là số nguyên tố chẵn duy nhất.` },
      { label: "B", content: t`Số $1$ không phải là số nguyên tố.` },
      { label: "C", content: t`Mọi số nguyên tố đều là số lẻ.`, correct: true },
      { label: "D", content: t`Số $0$ không phải là số nguyên tố.` },
    ],
    answer: t`**C.** Mọi số nguyên tố đều là số lẻ.`,
    solution: t`Số $2$ là số nguyên tố nhưng là số chẵn, nên khẳng định "mọi số nguyên tố đều là số lẻ" là sai. Các khẳng định A, B, D đều đúng.`,
    verify: () => isPrime(2) && !isPrime(1) && !isPrime(0) && range(3, 1000).filter((x) => isPrime(x) && x % 2 === 0).length === 0,
  },
  {
    topic: `${C}/so-nguyen-to`, difficulty: "ADVANCED", type: "ESSAY", tags: ["tìm k"],
    content: t`Tìm số tự nhiên $k$ để $3 \cdot k$ là số nguyên tố.`,
    answer: t`$k = 1$`,
    solution: t`- Nếu $k = 0$ thì $3k = 0$, không là số nguyên tố.
- Nếu $k = 1$ thì $3k = 3$ là số nguyên tố.
- Nếu $k \ge 2$ thì $3k$ có ít nhất ba ước $1, 3, 3k$ nên là hợp số.

Vậy $k = 1$.`,
    verify: () => sameList(range(0, 500).filter((k) => isPrime(3 * k)), [1]),
  },
  {
    topic: `${C}/so-nguyen-to`, difficulty: "ADVANCED", type: "ESSAY", tags: ["điền chữ số"],
    content: t`Thay dấu $*$ bằng chữ số thích hợp để $\overline{1*}$ là số nguyên tố.`,
    answer: t`$* \in \{1; 3; 7; 9\}$`,
    solution: t`$\overline{1*}$ là các số từ $10$ đến $19$. Trong đó các số nguyên tố là $11;\ 13;\ 17;\ 19$.

Vậy $* \in \{1; 3; 7; 9\}$.`,
    verify: () => sameList(range(0, 9).filter((d) => isPrime(10 + d)), [1, 3, 7, 9]),
  },

  // ── Phân tích ra thừa số nguyên tố ──
  {
    topic: `${C}/phan-tich-thua-so-nguyen-to`, difficulty: "BASIC", type: "ESSAY", tags: ["phân tích"],
    content: t`Phân tích số $60$ ra thừa số nguyên tố.`,
    answer: t`$60 = 2^2 \cdot 3 \cdot 5$`,
    solution: t`$60 = 2 \cdot 30 = 2 \cdot 2 \cdot 15 = 2 \cdot 2 \cdot 3 \cdot 5$.

Vậy $60 = 2^2 \cdot 3 \cdot 5$.`,
    verify: () => sameFactorization(factorize(60), { 2: 2, 3: 1, 5: 1 }),
  },
  {
    topic: `${C}/phan-tich-thua-so-nguyen-to`, difficulty: "BASIC", type: "ESSAY", tags: ["phân tích"],
    content: t`Phân tích số $84$ ra thừa số nguyên tố.`,
    answer: t`$84 = 2^2 \cdot 3 \cdot 7$`,
    solution: t`$84 = 2 \cdot 42 = 2 \cdot 2 \cdot 21 = 2 \cdot 2 \cdot 3 \cdot 7$.

Vậy $84 = 2^2 \cdot 3 \cdot 7$.`,
    verify: () => sameFactorization(factorize(84), { 2: 2, 3: 1, 7: 1 }),
  },
  {
    topic: `${C}/phan-tich-thua-so-nguyen-to`, difficulty: "BASIC", type: "SINGLE_CHOICE", tags: ["phân tích"],
    content: t`Kết quả phân tích số $72$ ra thừa số nguyên tố là:`,
    options: [
      { label: "A", content: t`$2^3 \cdot 3^2$`, correct: true },
      { label: "B", content: t`$2^2 \cdot 3^3$` },
      { label: "C", content: t`$8 \cdot 9$` },
      { label: "D", content: t`$2^3 \cdot 9$` },
    ],
    answer: t`**A.** $2^3 \cdot 3^2$`,
    solution: t`$72 = 2 \cdot 2 \cdot 2 \cdot 3 \cdot 3 = 2^3 \cdot 3^2$.

Phương án C, D có thừa số $8$, $9$ không phải số nguyên tố; phương án B bằng $108$.`,
    verify: () => sameFactorization(factorize(72), { 2: 3, 3: 2 }) && 2 ** 2 * 3 ** 3 !== 72,
  },
  {
    topic: `${C}/phan-tich-thua-so-nguyen-to`, difficulty: "APPLIED", type: "ESSAY", tags: ["phân tích"],
    content: t`Phân tích số $450$ ra thừa số nguyên tố.`,
    answer: t`$450 = 2 \cdot 3^2 \cdot 5^2$`,
    solution: t`$450 = 2 \cdot 225 = 2 \cdot 9 \cdot 25 = 2 \cdot 3 \cdot 3 \cdot 5 \cdot 5$.

Vậy $450 = 2 \cdot 3^2 \cdot 5^2$.`,
    verify: () => sameFactorization(factorize(450), { 2: 1, 3: 2, 5: 2 }),
  },
  {
    topic: `${C}/phan-tich-thua-so-nguyen-to`, difficulty: "APPLIED", type: "ESSAY", tags: ["phân tích"],
    content: t`Phân tích số $1\,200$ ra thừa số nguyên tố.`,
    answer: t`$1\,200 = 2^4 \cdot 3 \cdot 5^2$`,
    solution: t`$1\,200 = 12 \cdot 100 = (2^2 \cdot 3) \cdot (2^2 \cdot 5^2) = 2^4 \cdot 3 \cdot 5^2$.`,
    verify: () => sameFactorization(factorize(1200), { 2: 4, 3: 1, 5: 2 }),
  },
  {
    topic: `${C}/phan-tich-thua-so-nguyen-to`, difficulty: "ADVANCED", type: "ESSAY", tags: ["đếm ước"],
    content: t`Cho $a = 2^3 \cdot 3^2$. Số $a$ có bao nhiêu ước? Hãy liệt kê các ước đó.`,
    answer: t`$a = 72$ có $12$ ước: $1; 2; 3; 4; 6; 8; 9; 12; 18; 24; 36; 72$.`,
    solution: t`$a = 8 \cdot 9 = 72$. Mỗi ước của $a$ có dạng $2^m \cdot 3^n$ với $m \in \{0; 1; 2; 3\}$ và $n \in \{0; 1; 2\}$.

Liệt kê: $1; 2; 3; 4; 6; 8; 9; 12; 18; 24; 36; 72$. Vậy $a$ có $12$ ước.`,
    verify: () => sameList(divisors(72), [1, 2, 3, 4, 6, 8, 9, 12, 18, 24, 36, 72]),
  },
  {
    topic: `${C}/phan-tich-thua-so-nguyen-to`, difficulty: "ADVANCED", type: "ESSAY", tags: ["vận dụng"],
    content: t`Tích của hai số tự nhiên liên tiếp bằng $156$. Tìm hai số đó.`,
    answer: t`$12$ và $13$.`,
    solution: t`Phân tích: $156 = 2^2 \cdot 3 \cdot 13 = (2^2 \cdot 3) \cdot 13 = 12 \cdot 13$.

$12$ và $13$ là hai số tự nhiên liên tiếp. Vậy hai số cần tìm là $12$ và $13$.`,
    verify: () => sameList(range(0, 200).filter((n) => n * (n + 1) === 156), [12]),
  },

  // ── ƯCLN ──
  {
    topic: `${C}/uoc-chung-lon-nhat`, difficulty: "BASIC", type: "ESSAY", tags: ["tìm ƯCLN"],
    content: t`Tìm $\text{ƯCLN}(24, 36)$.`,
    answer: t`$\text{ƯCLN}(24, 36) = 12$`,
    solution: t`$24 = 2^3 \cdot 3$; $\;36 = 2^2 \cdot 3^2$.

Thừa số chung là $2$ và $3$, lấy số mũ nhỏ nhất: $\text{ƯCLN}(24, 36) = 2^2 \cdot 3 = 12$.`,
    verify: () => gcd(24, 36) === 12,
  },
  {
    topic: `${C}/uoc-chung-lon-nhat`, difficulty: "BASIC", type: "ESSAY", tags: ["tìm ƯC qua ƯCLN"],
    content: t`Tìm $\text{ƯCLN}(18, 30)$, từ đó tìm $\text{ƯC}(18, 30)$.`,
    answer: t`$\text{ƯCLN}(18, 30) = 6$; $\;\text{ƯC}(18, 30) = \{1; 2; 3; 6\}$.`,
    solution: t`$18 = 2 \cdot 3^2$; $\;30 = 2 \cdot 3 \cdot 5$ nên $\text{ƯCLN}(18, 30) = 2 \cdot 3 = 6$.

Các ước chung là các ước của ƯCLN: $\text{ƯC}(18, 30) = \text{Ư}(6) = \{1; 2; 3; 6\}$.`,
    verify: () => gcd(18, 30) === 6 && sameList(divisors(6), [1, 2, 3, 6]),
  },
  {
    topic: `${C}/uoc-chung-lon-nhat`, difficulty: "BASIC", type: "SINGLE_CHOICE", tags: ["nguyên tố cùng nhau"],
    content: t`$\text{ƯCLN}(15, 28)$ bằng:`,
    options: [
      { label: "A", content: t`$1$`, correct: true },
      { label: "B", content: t`$3$` },
      { label: "C", content: t`$5$` },
      { label: "D", content: t`$7$` },
    ],
    answer: t`**A.** $1$`,
    solution: t`$15 = 3 \cdot 5$; $\;28 = 2^2 \cdot 7$. Hai số không có thừa số nguyên tố chung nên $\text{ƯCLN}(15, 28) = 1$ — $15$ và $28$ là hai số nguyên tố cùng nhau.`,
    verify: () => gcd(15, 28) === 1,
  },
  {
    topic: `${C}/uoc-chung-lon-nhat`, difficulty: "APPLIED", type: "ESSAY", tags: ["ƯCLN ba số"],
    content: t`Tìm $\text{ƯCLN}(56, 140, 168)$.`,
    answer: t`$28$`,
    solution: t`$56 = 2^3 \cdot 7$; $\;140 = 2^2 \cdot 5 \cdot 7$; $\;168 = 2^3 \cdot 3 \cdot 7$.

Thừa số chung là $2$ và $7$, lấy số mũ nhỏ nhất: $\text{ƯCLN} = 2^2 \cdot 7 = 28$.`,
    verify: () => gcdMany(56, 140, 168) === 28,
  },
  {
    topic: `${C}/uoc-chung-lon-nhat`, difficulty: "APPLIED", type: "ESSAY", tags: ["bài toán chia đều"],
    content: t`Cô giáo có $24$ quyển vở và $36$ chiếc bút chì, muốn chia đều thành các phần quà như nhau (mỗi phần có cả vở và bút). Có thể chia được nhiều nhất bao nhiêu phần quà? Khi đó mỗi phần gồm bao nhiêu quyển vở, bao nhiêu chiếc bút chì?`,
    answer: t`Nhiều nhất $12$ phần quà; mỗi phần gồm $2$ quyển vở và $3$ chiếc bút chì.`,
    solution: t`Số phần quà là ước chung của $24$ và $36$; nhiều nhất là $\text{ƯCLN}(24, 36) = 12$.

Mỗi phần có $24 : 12 = 2$ quyển vở và $36 : 12 = 3$ chiếc bút chì.`,
    verify: () => gcd(24, 36) === 12 && 24 / 12 === 2 && 36 / 12 === 3,
  },
  {
    topic: `${C}/uoc-chung-lon-nhat`, difficulty: "APPLIED", type: "ESSAY", tags: ["bài toán thực tế"],
    content: t`Một mảnh vườn hình chữ nhật có chiều dài $112\,\text{m}$, chiều rộng $40\,\text{m}$. Người ta muốn chia mảnh vườn thành các ô vuông bằng nhau, có cạnh là số tự nhiên (mét) và lớn nhất có thể. Tính độ dài cạnh mỗi ô vuông và số ô vuông.`,
    answer: t`Cạnh ô vuông $8\,\text{m}$; có $70$ ô vuông.`,
    solution: t`Độ dài cạnh ô vuông là ước chung lớn nhất của $112$ và $40$.

$112 = 2^4 \cdot 7$; $\;40 = 2^3 \cdot 5$ nên $\text{ƯCLN}(112, 40) = 2^3 = 8$.

Số ô vuông: $(112 : 8) \cdot (40 : 8) = 14 \cdot 5 = 70$ (ô).`,
    verify: () => gcd(112, 40) === 8 && (112 / 8) * (40 / 8) === 70,
  },
  {
    topic: `${C}/uoc-chung-lon-nhat`, difficulty: "ADVANCED", type: "ESSAY", tags: ["tìm x qua ƯCLN"],
    content: t`Tìm số tự nhiên $x$ lớn nhất, biết $420 \,\vdots\, x$ và $700 \,\vdots\, x$.`,
    answer: t`$x = 140$`,
    solution: t`$x$ là ước chung của $420$ và $700$, lớn nhất nên $x = \text{ƯCLN}(420, 700)$.

$420 = 2^2 \cdot 3 \cdot 5 \cdot 7$; $\;700 = 2^2 \cdot 5^2 \cdot 7$.

$\text{ƯCLN}(420, 700) = 2^2 \cdot 5 \cdot 7 = 140$. Vậy $x = 140$.`,
    verify: () => gcd(420, 700) === 140,
  },
  {
    topic: `${C}/uoc-chung-lon-nhat`, difficulty: "ADVANCED", type: "ESSAY", tags: ["tìm hai số"],
    content: t`Tìm hai số tự nhiên $a, b$ ($a < b$), biết $a + b = 84$ và $\text{ƯCLN}(a, b) = 6$.`,
    answer: t`$(a; b) \in \{(6; 78);\ (18; 66);\ (30; 54)\}$`,
    solution: t`Vì $\text{ƯCLN}(a, b) = 6$ nên $a = 6m$, $b = 6n$ với $\text{ƯCLN}(m, n) = 1$ và $m < n$.

$6m + 6n = 84 \Rightarrow m + n = 14$.

Các cặp $(m; n)$ nguyên tố cùng nhau, $m < n$, $m + n = 14$: $(1; 13)$, $(3; 11)$, $(5; 9)$. (Loại $(2; 12)$, $(4; 10)$, $(6; 8)$ vì không nguyên tố cùng nhau.)

Vậy $(a; b) \in \{(6; 78);\ (18; 66);\ (30; 54)\}$.`,
    verify: () => {
      const pairs: number[] = [];
      for (const a of range(1, 41)) if (gcd(a, 84 - a) === 6) pairs.push(a);
      return sameList(pairs, [6, 18, 30]);
    },
  },

  // ── BCNN ──
  {
    topic: `${C}/boi-chung-nho-nhat`, difficulty: "BASIC", type: "ESSAY", tags: ["tìm BCNN"],
    content: t`Tìm $\text{BCNN}(6, 8)$.`,
    answer: t`$\text{BCNN}(6, 8) = 24$`,
    solution: t`$6 = 2 \cdot 3$; $\;8 = 2^3$.

Thừa số chung và riêng: $2, 3$; lấy số mũ lớn nhất: $\text{BCNN}(6, 8) = 2^3 \cdot 3 = 24$.`,
    verify: () => lcm(6, 8) === 24,
  },
  {
    topic: `${C}/boi-chung-nho-nhat`, difficulty: "BASIC", type: "ESSAY", tags: ["tìm BCNN"],
    content: t`Tìm $\text{BCNN}(12, 18)$.`,
    answer: t`$\text{BCNN}(12, 18) = 36$`,
    solution: t`$12 = 2^2 \cdot 3$; $\;18 = 2 \cdot 3^2$.

$\text{BCNN}(12, 18) = 2^2 \cdot 3^2 = 36$.`,
    verify: () => lcm(12, 18) === 36,
  },
  {
    topic: `${C}/boi-chung-nho-nhat`, difficulty: "BASIC", type: "SINGLE_CHOICE", tags: ["nguyên tố cùng nhau"],
    content: t`$\text{BCNN}(4, 9)$ bằng:`,
    options: [
      { label: "A", content: t`$13$` },
      { label: "B", content: t`$36$`, correct: true },
      { label: "C", content: t`$18$` },
      { label: "D", content: t`$72$` },
    ],
    answer: t`**B.** $36$`,
    solution: t`$4 = 2^2$ và $9 = 3^2$ không có thừa số chung (nguyên tố cùng nhau), nên $\text{BCNN}(4, 9) = 4 \cdot 9 = 36$.`,
    verify: () => lcm(4, 9) === 36,
  },
  {
    topic: `${C}/boi-chung-nho-nhat`, difficulty: "APPLIED", type: "ESSAY", tags: ["BCNN ba số"],
    content: t`Tìm $\text{BCNN}(10, 12, 15)$.`,
    answer: t`$60$`,
    solution: t`$10 = 2 \cdot 5$; $\;12 = 2^2 \cdot 3$; $\;15 = 3 \cdot 5$.

$\text{BCNN}(10, 12, 15) = 2^2 \cdot 3 \cdot 5 = 60$.`,
    verify: () => lcmMany(10, 12, 15) === 60,
  },
  {
    topic: `${C}/boi-chung-nho-nhat`, difficulty: "APPLIED", type: "ESSAY", tags: ["bài toán chu kì"],
    content: t`Hai xe buýt cùng rời bến lúc $6$ giờ sáng. Xe thứ nhất cứ $15$ phút lại quay về bến và xuất phát, xe thứ hai cứ $20$ phút. Hỏi sau ít nhất bao nhiêu phút hai xe lại cùng xuất phát ở bến? Lúc đó là mấy giờ?`,
    answer: t`Sau ít nhất $60$ phút, lúc $7$ giờ sáng.`,
    solution: t`Khoảng thời gian cần tìm là bội chung nhỏ nhất của $15$ và $20$.

$15 = 3 \cdot 5$; $\;20 = 2^2 \cdot 5$ nên $\text{BCNN}(15, 20) = 2^2 \cdot 3 \cdot 5 = 60$.

Sau $60$ phút $= 1$ giờ, tức là lúc $7$ giờ sáng, hai xe lại cùng xuất phát.`,
    verify: () => lcm(15, 20) === 60,
  },
  {
    topic: `${C}/boi-chung-nho-nhat`, difficulty: "APPLIED", type: "ESSAY", tags: ["tìm BC qua BCNN"],
    content: t`Tìm các bội chung nhỏ hơn $200$ của $30$ và $45$.`,
    answer: t`$0;\ 90;\ 180$`,
    solution: t`$30 = 2 \cdot 3 \cdot 5$; $\;45 = 3^2 \cdot 5$ nên $\text{BCNN}(30, 45) = 2 \cdot 3^2 \cdot 5 = 90$.

Các bội chung là bội của $90$: $0, 90, 180, 270, \dots$ Những số nhỏ hơn $200$ là $0;\ 90;\ 180$.`,
    verify: () => sameList(range(0, 199).filter((x) => x % 30 === 0 && x % 45 === 0), [0, 90, 180]),
  },
  {
    topic: `${C}/boi-chung-nho-nhat`, difficulty: "ADVANCED", type: "ESSAY", tags: ["bài toán xếp hàng"],
    content: t`Số học sinh khối 6 của một trường trong khoảng từ $300$ đến $400$ em. Khi xếp hàng $12$, hàng $15$ hay hàng $18$ đều vừa đủ, không thừa ai. Tính số học sinh khối 6.`,
    answer: t`$360$ học sinh.`,
    solution: t`Số học sinh là bội chung của $12, 15, 18$.

$12 = 2^2 \cdot 3$; $\;15 = 3 \cdot 5$; $\;18 = 2 \cdot 3^2$ nên $\text{BCNN}(12, 15, 18) = 2^2 \cdot 3^2 \cdot 5 = 180$.

Bội chung: $0, 180, 360, 540, \dots$ Trong khoảng từ $300$ đến $400$ chỉ có $360$.`,
    verify: () => lcmMany(12, 15, 18) === 180 && sameList(range(300, 400).filter((x) => x % 180 === 0), [360]),
  },
  {
    topic: `${C}/boi-chung-nho-nhat`, difficulty: "ADVANCED", type: "ESSAY", tags: ["bài toán xếp hàng", "có dư"],
    content: t`Một nhóm học sinh khi xếp hàng $10$, hàng $12$ hay hàng $15$ đều thừa $3$ em. Biết số học sinh trong khoảng từ $100$ đến $150$. Tính số học sinh.`,
    answer: t`$123$ học sinh.`,
    solution: t`Gọi số học sinh là $n$. Khi bớt $3$ em thì số còn lại chia hết cho $10, 12, 15$, nên $n - 3$ là bội chung của $10, 12, 15$.

$\text{BCNN}(10, 12, 15) = 60$, nên $n - 3 \in \{0; 60; 120; 180; \dots\}$, tức là $n \in \{3; 63; 123; 183; \dots\}$.

Vì $100 \le n \le 150$ nên $n = 123$.`,
    verify: () => sameList(range(100, 150).filter((n) => n % 10 === 3 && n % 12 === 3 && n % 15 === 3), [123]),
  },
  {
    topic: `${C}/boi-chung-nho-nhat`, difficulty: "ADVANCED", type: "SHORT_ANSWER", tags: ["BCNN ba số"],
    content: t`Tìm số tự nhiên nhỏ nhất khác $0$ chia hết cho cả $8$, $12$ và $20$.`,
    answer: t`$120$`,
    solution: t`Số cần tìm là $\text{BCNN}(8, 12, 20)$.

$8 = 2^3$; $\;12 = 2^2 \cdot 3$; $\;20 = 2^2 \cdot 5$ nên $\text{BCNN} = 2^3 \cdot 3 \cdot 5 = 120$.`,
    verify: () => lcmMany(8, 12, 20) === 120,
  },
];
