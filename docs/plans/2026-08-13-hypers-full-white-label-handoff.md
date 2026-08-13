# HyperS Full White-Label — Implementation Handoff

## 1. Mục đích tài liệu

Đây là tài liệu chỉ đạo cho model triển khai. Model nhận bàn giao phải thực hiện trọn gói việc thay nhận diện ứng dụng Provider từ Medplum sang HyperS trong một nhánh và một pull request, sau đó chạy kiểm tra đầy đủ. Không tự mở rộng sang thay đổi nghiệp vụ, schema FHIR, backend API hoặc xây các route/tài liệu chưa tồn tại.

Kết quả cần đạt: khách hàng mở `http://localhost:3001` chỉ thấy thương hiệu HyperS, giao diện tiếng Anh, hệ màu xanh dương theo landing page HyperS, không còn logo/màu tím/chữ/link Medplum trên các bề mặt UI của Provider, và ứng dụng vẫn kết nối hoàn toàn với API local tại `http://localhost:8103`.

File ghi chú bắt buộc trong lúc triển khai: `docs/plans/2026-08-13-hypers-full-white-label-implementation-notes.md`. Model triển khai phải tạo file này trước khi sửa code với heading `## Deviations`. Mọi sai lệch giữa kế hoạch và code thực tế phải ghi: kế hoạch yêu cầu gì, code buộc phải làm gì, quyết định đã chọn và bằng chứng kiểm tra.

## 2. Vai trò và quyền hạn của model triển khai

Model triển khai được phép:

- Sửa UI, theme, asset, metadata, tài liệu phát triển, cấu hình local và CI trong repository Provider.
- Sao chép logo đã được duyệt từ dự án tham chiếu.
- Sao chép Docker Compose local vào repository HyperS; không di chuyển hoặc xóa bản gốc.
- Tạo nhánh, commit và push nhánh lên repository HyperS sau khi các cổng kiểm tra đạt.

Model triển khai không được phép:

- Thay đổi dữ liệu FHIR, xóa volume/database, reset tài khoản hoặc thay đổi nghiệp vụ lâm sàng.
- Đổi tên package/import `@medplum/*`, class/hook kỹ thuật như `MedplumClient`, biến môi trường `MEDPLUM_*`, Docker image hoặc URI canonical dùng trong FHIR.
- Xây backend tài liệu, support, pricing hoặc route giả.
- Push thẳng bản rebrand vào `main`, force-push, xóa lịch sử Git hoặc xóa `.git` bên ngoài.
- Tạo logo/illustration mới bằng AI. Chỉ được xử lý kích thước, crop/padding và định dạng từ logo đã duyệt.
- Tự quyết định mở rộng sang Admin App ở `localhost:3002`.

## 3. Hiện trạng đã xác minh

### 3.1 Source và Git

- Working repository thực tế: `C:\Users\ADMIN\Documents\ChatGPT\medplum clone\medplum-provider`.
- Upstream hiện tại: `https://github.com/medplum/medplum-provider.git`.
- Upstream baseline: commit `ad8451d` (`Release Version 5.1.29`).
- Nhánh hiện tại: `main` theo dõi `origin/main`.
- Hai thay đổi local đã có trước bàn giao và phải được bảo toàn: `.env` trỏ API về localhost; `package.json` bổ sung/sắp xếp dependency cần cho standalone build.
- Thư mục cha `C:\Users\ADMIN\Documents\ChatGPT\medplum clone` có một Git repository rỗng lồng ngoài. Không dùng repository cha và không xóa nó trong task này; mọi lệnh Git phải chạy với `git -C medplum-provider ...` hoặc từ bên trong `medplum-provider`.

### 3.2 GitHub đích

- Repository đích: `https://github.com/DinhLucent/hyperS-clinical-managerment.git`.
- Đã xác minh repository là `PRIVATE`, đang rỗng và GitHub CLI đăng nhập bằng tài khoản `DinhLucent`.
- Tên remote đích: `origin`.
- Remote Medplum sau khi setup: `upstream`, chỉ dùng để so sánh/cập nhật về sau.
- Nhánh triển khai: `codex/hypers-white-label`.

### 3.3 Runtime local

- Provider UI: `http://localhost:3001`.
- API local: `http://localhost:8103`.
- Admin App: `http://localhost:3002`, là công cụ vận hành và không thuộc bề mặt demo khách hàng. Host port 3000 đang thuộc một ứng dụng PM2 khác trên máy.
- Docker Compose hiện có: `C:\Users\ADMIN\Documents\ChatGPT\medplum clone\medplum-local-stack\docker-compose.yml`.
- Compose đang dùng PostgreSQL 16, Redis 7, `medplum/medplum-server:5.1.29` và `medplum/medplum-app:5.1.29`.
- Lần cài đặt đầu tiên vẫn có thể cần Internet để tải npm package và Docker image; yêu cầu “local” nghĩa là runtime/API/database không phụ thuộc Medplum Cloud.

### 3.4 Brand reference đã duyệt

- Dự án tham chiếu: `D:\MyProject\my-landingpage`.
- Logo được duyệt: `D:\MyProject\my-landingpage\public\brand-mark.png`.
- Logo nguồn là PNG ARGB trong suốt, kích thước hiện tại `655 x 807`; không được kéo méo thành hình vuông.
- Source of truth về màu là CSS đang chạy trong `D:\MyProject\my-landingpage\src\app\globals.css`, không phải mockup Stitch cũ nếu hai nguồn khác nhau.
- Tên thương hiệu hiển thị: `HyperS`.
- Ngôn ngữ UI: giữ tiếng Anh.

### 3.5 Baseline verification đã chạy

| Gate | Kết quả baseline | Chỉ đạo |
|---|---|---|
| `npm run build` | PASS; Vite build 8.27 giây, có warning `__dirname`/large chunk nhưng không fail | Không sửa chunking hoặc Vite warning trong rebrand; chỉ bảo đảm không có warning/error mới do thay đổi. |
| `npm run lint` | FAIL trước khi lint source: ESLint 9 không tìm thấy `eslint.config.*` | Thêm flat config standalone dùng export có sẵn từ `@medplum/eslint-config`; không tắt lint gate. |
| `npm test` | 110/116 test files pass; 1.271/1.285 tests pass; 14 fail | Không bỏ/skip test. Mười lỗi SignIn/Register/ResourcePage đi qua Medplum `<Logo>` đọc `import.meta.env.MEDPLUM_LOGO_URL`; việc thay logo phải làm nhóm này pass. Bốn lỗi còn lại là `vi.spyOn` trên ESM namespace không configurable và cần test-only repair. |
| `docker compose ... config --quiet` | PASS với Compose hiện tại | Bản copy trong `infra/local` phải tiếp tục pass và không đổi volume identity. |
| Mantine theme API | VERIFIED trong Mantine 8.3.18 types | `MantineProvider.forceColorScheme`, `theme.primaryColor` và `MantineColorsTuple` đều tồn tại; không cần workaround riêng. |

## 4. Phạm vi sản phẩm đã chốt

### Trong phạm vi

- Toàn bộ bề mặt UI của Provider tại port 3001: browser metadata, favicon, AppShell, sign-in, registration, onboarding/Get Started, schedule banners, Spaces, medication badges, integration CTA và các fallback copy.
- Hệ theme Mantine dùng màu HyperS; loại bỏ màu violet/purple còn sót trong code UI.
- Xóa mọi link có thể click đến Medplum docs/pricing/Discord/email khỏi Provider.
- Thay link chưa có đích bằng nội dung không tương tác hoặc nút disabled có nhãn `Coming soon`; không dùng `href=""`, `href="#"` hoặc JavaScript no-op giả làm link.
- Xử lý chính sách hình ảnh và logo.
- Cấu hình local an toàn, README HyperS và GitHub Actions tối thiểu.
- Kiểm tra desktop/mobile và đảm bảo không phát sinh request đến Medplum Cloud trong smoke flow.

### Ngoài phạm vi

- Full theme Admin App tại port 3002. Image hiện tại là image dựng sẵn của Medplum; đổi toàn bộ màu cần build/fork monorepo và làm tăng mạnh chi phí bảo trì. Admin không được đưa vào demo và không được liên kết từ Provider.
- Dark mode. Bản tham chiếu HyperS là light-first; Provider phải khóa light mode cho demo để không phát sinh một palette tối chưa được duyệt.
- Dịch giao diện sang tiếng Việt.
- Xây website docs, pricing, Discord/community, support email backend hoặc route mới.
- Đổi logic đăng nhập, phân quyền, nghiệp vụ, integration behavior, dữ liệu mẫu hoặc clinical terminology.
- Đổi URI `system`, `url`, `identifier`, canonical FHIR hoặc bot identifier chỉ vì có chữ `medplum`.
- Cloud deployment, domain, TLS, registry hoặc phát hành production.
- Multi-brand engine, tenant-specific theme, feature flag hoặc brand editor.
- Sửa Vite chunk-size warning, đổi bundler hoặc tối ưu hiệu năng không liên quan đến brand.

## 5. Quyết định thiết kế bắt buộc

### 5.1 Brand tokens

Dùng một brand module nhỏ, không xây framework đa thương hiệu. Token mục tiêu:

| Vai trò | Giá trị |
|---|---|
| Primary | `#1264FF` |
| Primary hover/deep | `#084ABF` |
| Ink | `#0B2944` |
| Ink deep | `#061B2D` |
| Muted text | `#5C6F82` |
| Border | `#DFE6EE` |
| Surface | `#FFFFFF` |
| Soft surface | `#F4F7FB` |
| Focus ring | `rgba(18, 100, 255, 0.35)` |

Mantine `blue` phải được override bằng một tuple 10 cấp để toàn bộ `color="blue"`, `c="blue.6"` và component primary hiện có tự đi theo HyperS:

`#EEF4FF`, `#D9E7FF`, `#BCD4FF`, `#8FB8FF`, `#5E97FF`, `#337AFF`, `#1264FF`, `#0C55DD`, `#084ABF`, `#063B99`.

Giữ semantic red/green/yellow cho error/success/warning; không ép tất cả trạng thái về màu thương hiệu. Border mảnh, shadow nhẹ, radius 6–12 px. Không thêm gradient lớn, glow tím hoặc animation trang trí.

### 5.2 Typography

Không tải Google Fonts hoặc font CDN. Giữ font system/Mantine hiện tại trong đợt này để runtime local không có network dependency. Có thể dùng font weight và spacing từ landing page, nhưng không thêm dependency font mới.

### 5.3 Logo

- Header lockup: logo mark + word `HyperS`.
- Auth lockup: logo mark + word `HyperS`, lớn hơn header.
- Logo phải có `aria-label="HyperS"`; image trang trí bên trong có `alt=""` nếu parent đã có accessible name.
- Giữ đúng tỷ lệ `655:807`, dùng `object-fit: contain`.
- Tạo favicon từ logo trên canvas vuông trong suốt với padding đồng đều; không kéo méo.
- Không dùng lại component `<Logo>` của `@medplum/react` ở bất kỳ UI surface nào.

### 5.4 Links và routing

- Link nội bộ hiện có như `/Patient`, `/Task`, `/Communication`, `/Calendar/Schedule`, `/integrations` phải tiếp tục hoạt động.
- Link Medplum docs/pricing/Discord/email phải bị loại bỏ khỏi DOM, không chỉ ẩn bằng CSS.
- CTA chưa có backend được render bằng button disabled hoặc card tĩnh có badge `Coming soon`.
- Link do dữ liệu người dùng hoặc tài liệu bệnh nhân cung cấp vẫn giữ chức năng; chúng không phải branding link.
- Link đến website nhà cung cấp trong trang Integrations có thể giữ vì đó là định danh integration, nhưng phải có `rel="noopener noreferrer"` khi mở tab mới.

### 5.5 Hình ảnh bên thứ ba

- `public/img/integrations/*` là logo của các vendor, không phải logo Medplum. Không recolor, không thay tên và không dùng làm logo HyperS.
- Chỉ giữ vendor logo nơi nó trực tiếp định danh một integration card.
- Cụm logo trang trí trong Get Started hiện dùng nhiều vendor logo để marketing. Xóa cụm trang trí này hoặc thay bằng bố cục icon Tabler trung tính; không tạo ảnh minh họa mới.
- `OpenAILogo` chỉ được giữ tại model selector/AI feature thực tế; không dùng ở vùng thương hiệu HyperS.

## 6. Ma trận file và chỉ đạo thay đổi

Line number bên dưới là anchor theo source tại thời điểm bàn giao; model phải tìm theo symbol/text trước khi sửa vì số dòng có thể dịch chuyển.

### 6.1 Brand foundation — thêm mới

| File/vị trí | Chỉ đạo |
|---|---|
| `src/brand/brand.ts` | Tạo constant duy nhất cho `name: 'HyperS'`, `productTitle: 'HyperS Clinical Management'`, palette, metadata color và các copy brand dùng lại. Không thêm runtime config/multi-tenant abstraction. |
| `src/brand/theme.ts` | Xuất Mantine theme dựa trên cấu hình typography hiện có trong `main.tsx`; override tuple `blue`, `primaryColor: 'blue'`, radius và shadow nhẹ. |
| `src/brand/HyperSLogo.tsx` | Tạo component lockup có prop tối thiểu `size` và `withWordmark`; render asset local, đúng tỷ lệ và accessible name. |
| `src/brand/HyperSLogo.module.css` | Chỉ chứa layout/logo sizing/wordmark; không dựng lại toàn bộ theme ở đây. |
| `public/brand/hypers-mark.png` | Bản web-optimized từ logo đã duyệt, nền trong suốt, không méo. |
| `public/favicon.ico` | Ghi đè favicon Medplum bằng favicon HyperS nhiều kích thước nếu tool hỗ trợ. |
| `public/apple-touch-icon.png` | Tạo icon vuông 180x180 có transparent padding; chỉ thêm nếu `index.html` khai báo nó. |
| `docs/branding/HYPERS_BRAND.md` | Ghi token, asset source, rule logo, policy link/image và phạm vi light-only để lần sửa sau không phân kỳ. |

### 6.2 Theme và application shell

| File/anchor hiện tại | Thay đổi bắt buộc |
|---|---|
| `src/main.tsx:24-41` — `createTheme` | Chuyển theme sang `src/brand/theme.ts`; bảo toàn font size/headings hiện có. MantineProvider phải dùng theme HyperS và khóa light color scheme bằng API Mantine 8 phù hợp. |
| `src/index.css` | Thêm CSS variables `--hypers-*`, body/surface/border/focus rules tối thiểu. Không override rộng làm hỏng layout của `@medplum/react`. |
| `src/App.tsx:5-6, 125-128` — import và `AppShell.logo` | Bỏ import `Logo`; dùng `<HyperSLogo size={28} withWordmark />`. Không đổi menu, route, spotlight hoặc auth logic. |
| `src/App.tsx:29` — `medplum-provider-setup-completed` | Giữ nguyên key để không làm reset trạng thái onboarding của người dùng; đây là storage key nội bộ, không hiển thị. |

### 6.3 Browser metadata và external runtime dependency

| File/anchor hiện tại | Thay đổi bắt buộc |
|---|---|
| `index.html:6` | `<title>HyperS Clinical Management</title>`. |
| `index.html:7` | Trỏ favicon HyperS; thêm apple touch icon nếu asset đã tạo. |
| `index.html` phần `<head>` | Thêm `application-name` và `theme-color=#1264FF`; description ngắn bằng tiếng Anh. |
| `index.html:11` | Xóa script `https://accounts.google.com/gsi/client`. Google client ID đang rỗng và script này tạo network request ngoài local ngay khi tải trang. |

### 6.4 Auth surfaces

| File/anchor hiện tại | Thay đổi bắt buộc |
|---|---|
| `src/pages/SignInPage.tsx:4, 26-29` | Bỏ `Logo` của Medplum; dùng HyperS lockup. Copy thành `Sign in to HyperS`. Giữ `SignInForm`, callback và route. |
| `src/pages/RegisterPage.tsx:4, 45-48` | Bỏ `Logo`; dùng HyperS lockup. Copy thành `Create your HyperS account`. Giữ logic enable/disable và submit hiện tại. |
| `src/pages/SignInPage.test.tsx` | Cập nhật expected copy/logo; line hiện tại khoảng 93 còn assert `Get Started with Medplum Provider`. Thêm assertion không có chữ Medplum trong rendered auth/onboarding flow. |
| `src/pages/RegisterPage.test.tsx`, `src/pages/resource/ResourcePage.test.tsx` | Chạy lại sau khi bỏ Medplum `<Logo>`; baseline cho thấy các case fail do `MEDPLUM_LOGO_URL`. Chỉ sửa test nếu expected copy/logo thay đổi, không nới assertion nghiệp vụ. |

Không sửa `@medplum/react` package. Nếu `SignInForm`/`RegisterForm` tự render một Medplum logo hoặc link ngoài mà child override không loại bỏ được, ghi bằng chứng DOM vào implementation notes và dừng theo STOP condition thay vì patch trực tiếp `node_modules`.

### 6.5 Get Started/onboarding

| File/anchor hiện tại | Thay đổi bắt buộc |
|---|---|
| `src/pages/getstarted/GetStartedPage.tsx:149-155` | Xóa stack vendor logo chỉ dùng trang trí; giữ vendor assets cho integration cards thực tế. |
| `GetStartedPage.tsx:163-184` | `Get Started with HyperS`; bỏ đoạn pricing/subscription và `support@medplum.com`. Viết lại ngắn: giới thiệu các bước cấu hình demo local, không hứa dịch vụ trả phí. |
| `GetStartedPage.tsx:472-668` | Đổi copy Medplum sang HyperS. Giữ cấu trúc 4 nhóm nội dung nhưng bỏ toàn bộ `component="a"`, `href`, `target` và external-link icon. Render title/list tĩnh với badge `Coming soon` vì HyperS docs chưa được xây. |
| `GetStartedPage.tsx:671-740` | Bỏ Discord Medplum và mailto Medplum. Thay bằng một card `HyperS Support` không tương tác, copy `Support channels are coming soon.` và disabled button `Coming soon`, hoặc bỏ toàn bộ section nếu bố cục sạch hơn. |
| Imports đầu file | Xóa icon/import chỉ phục vụ external link/vendor collage sau khi UI được giản lược. Giữ `MedplumLink` vì đó là component navigation nội bộ, không phải logo/link Medplum ngoài. |

### 6.6 Docs links và release banner

| File/anchor hiện tại | Thay đổi bắt buộc |
|---|---|
| `src/components/DocsLink.tsx:1-22` | Xóa component sau khi đã bỏ mọi caller. Không biến nó thành link rỗng. |
| `src/components/ReleaseStageBanner.tsx:4-8, 28-30` | Bỏ `DocsLink`, external-link icon và button docs; giữ badge Alpha/Beta cùng nội dung cảnh báo. |
| `src/pages/schedule/ScheduleSettingsPage.tsx:40, 126` | Bỏ import/usage `DocsLink`; giữ câu hướng dẫn dưới dạng text thường: `configuring scheduling`. |
| `src/components/ReleaseStageBanner.module.css:13,17` | Đổi violet token sang blue token HyperS tương ứng; bảo đảm contrast của pill và text. |

### 6.7 Các chuỗi và CTA Medplum khác

| File/anchor hiện tại | Thay đổi bắt buộc |
|---|---|
| `src/pages/integrations/IntegrationsPage.tsx:202-203` | Xóa body `Hello Medplum team` và `mailto:hello@medplum.com`. CTA request integration phải disabled/`Coming soon`; không mở mail client. Cập nhật test tại `IntegrationsPage.test.tsx:112,173`. |
| `src/pages/smart/SmartHealthLinkImportPage.tsx:63` | Đổi fallback hiển thị từ `Medplum Provider` thành `HyperS`. Không đổi logic `medplum.getProject()`. |
| `README.md` | Viết lại thành README HyperS: mục tiêu demo, prerequisites, local run, port, account setup, kiểm tra, giới hạn terminology local. Xóa marketing/docs/Discord/pricing links Medplum khỏi README chính. |
| `NOTICE.md` — thêm mới | Ghi rõ source được phát triển từ Medplum Provider 5.1.29 / commit `ad8451d`, giữ Apache-2.0 attribution và chỉ rõ dependency/runtime upstream. File này là tài liệu kỹ thuật, không render trong UI. |
| `LICENSE.txt` | Giữ nguyên hoàn toàn. Không xóa copyright header `Medplum contributors` khỏi source hiện có. |
| `package.json:2` | Đổi package name thành `hypers-clinical-management`; version sản phẩm bắt đầu `0.1.0`. Giữ nguyên dependency `@medplum/*`. |
| `eslint.config.mjs` — thêm mới | Dùng đúng hai statement: `import { medplumEslintConfig } from '@medplum/eslint-config';` và `export default medplumEslintConfig;`. Đây là flat config ESLint 9 mà package đã cung cấp; không viết rule set mới và không disable rule để lấy CI xanh. |

### 6.8 Baseline test-harness repair có giới hạn

Chỉ được sửa bốn lỗi baseline không liên quan production behavior sau; dùng `vi.mock` factory/behavior assertion thay cho `vi.spyOn` trên ESM namespace export:

| File | Baseline failure | Repair cho phép |
|---|---|---|
| `src/utils/notifications.test.ts:10-11` | Không thể spy `normalizeErrorString`/notifications ESM export | Mock module trước import hoặc assert trực tiếp payload notification từ một `Error` thật. Không sửa `src/utils/notifications.ts` nếu production behavior đúng. |
| `src/pages/patient/ExportTab.test.tsx:19` | Không thể spy `PatientExportForm` export | Dùng async `vi.mock('@medplum/react', importOriginal => ({ ...actual, PatientExportForm: mock }))`; giữ hai assertions về render và patient reference. |
| `src/pages/patient/PatientPage.test.tsx:127` | Không thể spy `PatientSummary` export | Dùng module mock cùng pattern hoặc đổi sang behavioral assertion tương đương; không sửa PatientPage production chỉ để test pass. |

Không sửa test khác ngoài các expected value bị đổi bởi brand. Sau repair, toàn bộ suite phải pass; không dùng `.skip`, `.only`, filter CI hoặc giảm số test.

### 6.9 Purple/violet sweep

Thay explicit violet/purple bằng `blue`/HyperS token nhưng giữ ý nghĩa trạng thái:

| File/anchor hiện tại | Thay đổi |
|---|---|
| `src/components/meds/MedListItem.tsx:48` | Badge violet → HyperS blue. |
| `src/components/spaces/SpacesInbox.tsx:502,505,540,543,581,584` | ThemeIcon/Text violet → blue shades từ theme. |
| `src/components/spaces/ResourceBox.tsx:76,80` | ThemeIcon/Text violet → blue. |
| `src/components/encounter/ClaimSubmittedPanel.tsx:155` | Status color return `violet` → `blue`, không đổi status mapping/logic. |
| `src/components/ReleaseStageBanner.module.css:13,17` | Violet CSS vars → blue CSS vars. |

Sau thay đổi, `rg -n -i 'violet|purple|magenta' src --glob '!*.test.*'` phải không còn match thuộc UI. Nếu match có ý nghĩa semantic khác, ghi vào implementation notes thay vì thay bừa.

### 6.10 Technical identifiers bắt buộc giữ

Các occurrence sau có chữ Medplum nhưng không phải branding UI. Không rename hoặc xóa:

- Toàn bộ import/package `@medplum/*` và type/class/hook `MedplumClient`, `MedplumProvider`, `useMedplum`, `MedplumLink`.
- Biến môi trường `MEDPLUM_BASE_URL`, `MEDPLUM_CLIENT_ID`, `MEDPLUM_REGISTER_ENABLED` và mọi `MEDPLUM_*` của server.
- Docker images `medplum/medplum-server:5.1.29`, `medplum/medplum-app:5.1.29`.
- `src/App.tsx:29` localStorage key.
- FHIR/canonical/bot identifiers trong `src/utils/encounter.ts`, `src/utils/scheduling.ts`, `src/utils/spacePersistence.ts`, `src/utils/intake-utils.ts`, `src/utils/spaceMessaging.ts`, `src/components/insurance/CoverageRequestInbox.tsx`, `src/pages/labs/OrderLabsPage.tsx`, `src/pages/resource/utils.ts`, `src/pages/patient/IntakeFormPage.tsx`, `src/components/fax/SendFaxModal.tsx`, `src/components/encounter/EncounterCoverageEligibilityModal.tsx` và `ClaimSubmittedPanel.tsx`.
- SPDX/copyright headers và test fixtures cần phản ánh identifiers kỹ thuật.

Nguyên tắc phân loại: URL được render thành `<a href>`, button hoặc browser redirect là branding/outbound và phải xử lý; URI nằm trong FHIR field `system`, `identifier`, canonical `url` hoặc API lookup phải giữ.

## 7. Local-host và repository setup

### 7.1 Git bootstrap an toàn

Thực hiện trước khi sửa code, từ thư mục `medplum-provider`:

1. Chạy `git status --short --branch`, `git diff -- .env package.json` và xác nhận chỉ có các thay đổi đã biết cộng với file bàn giao.
2. `git remote rename origin upstream`.
3. `git remote add origin https://github.com/DinhLucent/hyperS-clinical-managerment.git`.
4. Xác minh `git remote -v`; không thay URL upstream.
5. Vì remote HyperS đang rỗng, push baseline chưa rebrand bằng `git push -u origin main`. Dirty working tree không ngăn push commit baseline `ad8451d`.
6. Tạo nhánh `git switch -c codex/hypers-white-label`; các thay đổi local hiện có phải đi theo nhánh.
7. Không commit secret. Không push nếu remote bỗng không còn rỗng hoặc `main` đã có lịch sử khác.

Commit đề xuất:

1. `chore: establish HyperS local development baseline`
2. `feat: add HyperS brand foundation`
3. `feat: white-label Provider surfaces`
4. `test: add brand audit and CI verification`

Một pull request duy nhất từ `codex/hypers-white-label` vào `main`. Không squash bắt buộc trước review; lịch sử từng phase giúp rollback.

### 7.2 Environment

| File | Chỉ đạo |
|---|---|
| `.env` | Giữ local-safe values: API `http://localhost:8103/`, registration theo demo, Google/reCAPTCHA rỗng. File hiện được upstream track; không đưa secret vào đây. |
| `.env.defaults` | Đổi default API từ hosted Medplum sang localhost; Google/reCAPTCHA rỗng để clone mới không gọi cloud. `vite.config.ts` đang copy file này sang `.env` khi `.env` chưa tồn tại. |
| `.gitignore` | Giữ `*.local` để `.env.local` không bị commit. Bỏ rule ignore `package-lock.json` và commit lockfile để `npm ci`/CI tái lập được build standalone. |
| `eslint.config.mjs` | Thêm flat config từ `@medplum/eslint-config` như mục 6.8; chạy lint và chỉ sửa violations thật, không thêm ignore rộng. |
| `vite.config.ts:13,32` | Giữ cơ chế copy `.env.defaults` và `envPrefix` hiện có; không rename `MEDPLUM_*`. Chỉ sửa nếu test chứng minh cấu hình local chưa được nạp. |

### 7.3 Docker local stack

- Tạo `infra/local/docker-compose.yml` bằng cách sao chép file hiện có từ thư mục cha; không move và không xóa source.
- Giữ compose project name/volume identifiers hiện tại để không tạo volume trống mới hoặc làm mất liên kết tới dữ liệu demo đang có.
- Đổi `MEDPLUM_SUPPORT_EMAIL` thành một giá trị HyperS local, ví dụ `"HyperS" <support@hypers.local>`; key môi trường vẫn giữ nguyên.
- Giữ service `medplum-app` và cấu hình auth hiện tại để không tạo rủi ro ngoài phạm vi. README đánh dấu port 3002 là operator-only; Provider không được link tới port này và khách hàng không được dùng nó trong demo.
- Không đổi Docker image name chỉ để white-label. Đây là implementation detail, không phải UI.
- Chạy `docker compose -f infra/local/docker-compose.yml config` trước khi up.
- Không chạy `down -v`; không xóa volume.

## 8. Thứ tự triển khai bắt buộc

### Phase 0 — Baseline và tracer check

1. Hoàn tất Git bootstrap.
2. Ghi Node/npm/Docker versions vào implementation notes.
3. Chạy baseline `npm install` theo trạng thái lockfile hiện tại, sau đó `npm run build`, `npm run lint`, `npm test`.
4. Chụp baseline `/signin` để so sánh.
5. Ghi mọi baseline failure; không sửa bug nghiệp vụ ngoài phạm vi.

### Phase 1 — Brand foundation

1. Copy/optimize logo và tạo favicon.
2. Tạo brand constants, theme, logo component.
3. Thay AppShell logo, metadata và auth pages.
4. Chạy app, kiểm tra `/signin` và `/register` trước khi sửa các trang còn lại. Đây là vertical slice đầu tiên.

Checkpoint: logo đúng tỷ lệ, browser title/favicons đúng, primary controls dùng `#1264FF`, không request Google script.

Sau tracer check, chạy lại các test SignIn/Register/ResourcePage. Nếu nhóm mười lỗi do `<Logo>` không giảm về 0, kiểm tra DOM/package public API trước khi tiếp tục sweep.

### Phase 2 — Visible white-label sweep

1. Xử lý Get Started, DocsLink, ReleaseStageBanner, schedule copy.
2. Xử lý Integrations mailto và Smart Health Link fallback.
3. Sweep violet/purple.
4. Xử lý image policy và dead imports.

Checkpoint: các lệnh brand audit ở mục Verification không còn user-facing match.

### Phase 3 — Local stack, docs và reproducibility

1. Đưa Compose vào `infra/local` và chỉ cập nhật support identity; giữ service topology/auth hiện tại.
2. Cập nhật `.env.defaults`, `.gitignore`, lockfile, package metadata.
3. Viết README HyperS, NOTICE và brand guide.
4. Thêm CI.

### Phase 4 — Verification, commit và push

1. Chạy toàn bộ cổng tự động.
2. Smoke test các màn hình được liệt kê.
3. Kiểm tra network/DOM và chụp screenshot desktop/mobile.
4. Review `git diff`; không stage file ngoài phạm vi.
5. Commit theo phase, push nhánh, mở PR. Không merge.

## 9. Tests và CI cần có

### Tests tối thiểu

- Test `HyperSLogo`: accessible name `HyperS`, đúng asset path, wordmark behavior.
- Cập nhật auth/onboarding tests để expected copy là HyperS.
- Cập nhật Integrations tests: CTA không còn mailto Medplum và thể hiện `Coming soon`/disabled state.
- Test ReleaseStageBanner nếu cần để bảo đảm bỏ docs link không làm mất stage/content.
- Repair bốn ESM-spy failures baseline đúng phạm vi mục 6.8; không thay production code để chiều test.
- Không thêm Playwright dependency chỉ cho task này. Dùng Vitest/Testing Library hiện có và browser smoke test thủ công.

### GitHub Actions

Tạo `.github/workflows/ci.yml`:

- Trigger `pull_request` và push vào `main`.
- Node 22 theo `package.json` engines.
- `npm ci`.
- `npm run lint`.
- `npm test`.
- `npm run build`.
- `docker compose -f infra/local/docker-compose.yml config`.
- Không deploy, publish package hoặc push Docker image.

## 10. Verification và expected result

Chạy từ repository root `medplum-provider`.

### 10.1 Source audit

```powershell
rg -n -i 'Medplum Provider|support@medplum\.com|hello@medplum\.com|discord\.gg/medplum' src index.html
```

Expected: không có output thuộc UI/test expectation cũ. SPDX/package/type identifiers không match pattern này.

```powershell
rg -n -i 'href=.*medplum|mailto:.*medplum|discord\.gg/medplum' src --glob '*.tsx'
```

Expected: không có output.

```powershell
rg -n '<Logo' src --glob '*.tsx'
```

Expected: không còn Medplum `<Logo>` usage. `HyperSLogo` không match pattern có dấu `<Logo`.

```powershell
rg -n -i 'violet|purple|magenta' src --glob '!*.test.*'
```

Expected: không có UI color match; nếu có semantic exception phải được ghi rõ trong implementation notes.

```powershell
rg -n -i 'medplum\.com' src --glob '*.ts' --glob '*.tsx'
```

Expected: vẫn còn các URI FHIR/canonical kỹ thuật đã liệt kê ở mục 6.10; không còn occurrence nào nằm trong `href`, `mailto`, browser redirect hoặc visible fallback copy.

### 10.2 Automated gates

```powershell
npm ci
npm run lint
npm test
npm run build
docker compose -f infra/local/docker-compose.yml config
```

Expected: exit code 0 cho từng lệnh. Nếu baseline đã có test failure, PR không được báo xanh giả; implementation notes phải nêu before/after và rebrand không được làm tăng số failure.

### 10.3 Runtime smoke test

Khởi động local API/database và Provider; kiểm tra ít nhất:

1. `/signin` — logo/wordmark HyperS, browser title/favicon, không logo Medplum.
2. `/register` — HyperS copy, registration form không thay behavior.
3. `/getstarted` — HyperS copy; docs/pricing/support/Discord không còn link hoạt động.
4. `/Patient` và một patient detail — shell/navigation/focus/primary buttons đúng màu.
5. `/Spaces/Communication` — không còn violet resource cards.
6. `/Calendar/Schedule` và một settings page — banner/schedule text không link Medplum.
7. `/integrations` — vendor cards hiển thị đúng; request CTA không gửi email Medplum.
8. `/smart-health-link` — fallback product name là HyperS khi project chưa có tên.

Viewport screenshots:

- Desktop `1440 x 900`: sign-in, Get Started, Patient, Spaces.
- Mobile `390 x 844`: sign-in, Get Started, navigation mở.

Browser/network expected:

- Không request đến `api.medplum.com`, `www.medplum.com`, `storybook.medplum.com`, `accounts.google.com` trong smoke flow.
- API request chỉ tới `localhost:8103`; UI từ `localhost:3001`.
- Không có console error mới, ảnh 404 hoặc React warning mới.
- Search DOM không có text `Medplum Provider`, `support@medplum.com`, `hello@medplum.com`, `Join Medplum Discord`.

### 10.4 Accessibility/visual acceptance

- Focus ring thấy rõ trên white/soft surface.
- Text primary/muted đạt contrast hợp lý; không dùng primary blue cho đoạn body dài.
- Logo không méo, không bị cắt ở header/auth/mobile và không có halo nền trắng.
- Disabled/Coming soon controls có disabled semantics, không chỉ đổi opacity.
- Không có horizontal overflow ở 390 px.

## 11. Rollback và recovery

Task không có database migration và không được mutate dữ liệu FHIR theo kế hoạch; rollback chủ yếu là code/config:

1. `main` trên HyperS remote phải giữ baseline `ad8451d` chưa rebrand. Nếu nhánh rebrand lỗi trước merge, ngừng dùng nhánh và chạy lại baseline từ `main`.
2. Mỗi phase có commit riêng. Nếu lỗi được phát hiện sau commit/push, dùng `git revert <commit>` theo thứ tự ngược; không force-push và không reset hard.
3. Docker Compose gốc ở `..\medplum-local-stack\docker-compose.yml` phải được giữ nguyên. Nếu bản copy trong repo không khởi động, quay lại dùng file gốc với cùng compose name/volumes; không chạy `down -v`.
4. Không rename volume hoặc compose project nên rollback code không đụng database. Xác minh PostgreSQL/Redis health sau khi quay lại.
5. Nếu asset/logo lỗi, revert riêng commit brand foundation; không xóa source logo đã duyệt.
6. Nếu CI/test harness repair tạo regression, revert commit test/CI riêng; không sửa production behavior để giữ test giả xanh.
7. Implementation notes và screenshot baseline phải được giữ để so sánh trước/sau rollback.

Recovery được coi là thành công khi baseline build lại pass, Provider mở được `/signin`, API vẫn ở `localhost:8103` và volume hiện có còn nguyên.

## 12. Tiêu chí hoàn thành

Task chỉ hoàn thành khi đồng thời đạt tất cả:

- Repository HyperS có baseline `main`, nhánh `codex/hypers-white-label` và PR chưa merge.
- Provider tại port 3001 hiển thị HyperS trên toàn bộ smoke surfaces.
- Không còn Medplum logo/favicon, user-facing Medplum copy, Medplum outbound links hoặc violet/purple UI.
- Technical dependencies/canonical identifiers vẫn nguyên vẹn và clinical flows smoke được.
- Runtime smoke không gọi Medplum Cloud/Google identity script.
- Lint, test, build và Compose config đạt hoặc baseline failures được chứng minh không tăng.
- README/brand guide/NOTICE/implementation notes đầy đủ.
- Screenshot desktop/mobile và kết quả command được gắn vào PR hoặc implementation notes.

## 13. STOP conditions — phải dừng và báo lại, không tự ứng biến

1. GitHub đích không còn rỗng, `main` có commit không thuộc baseline `ad8451d`, hoặc remote owner/visibility khác với thông tin đã xác minh.
2. Working tree trước khi triển khai có thay đổi ngoài `.env`, `package.json` và tài liệu bàn giao mà model không xác định được chủ sở hữu.
3. Cần force-push, rewrite history, xóa `.git`, xóa file dữ liệu hoặc chạy `docker compose down -v`.
4. Logo nguồn không đọc được, bị thay bằng asset khác, hoặc việc xuất favicon buộc phải vẽ lại nhận diện.
5. `SignInForm`, `RegisterForm` hoặc `AppShell` từ package dependency tự render branding Medplum không thể override bằng public API; không patch `node_modules`.
6. Một occurrence `medplum.com` là FHIR canonical/system/identifier hoặc bot lookup nhưng yêu cầu “xóa hết” sẽ làm hỏng behavior. Giữ nguyên và báo rõ vị trí.
7. Muốn đưa Admin App port 3002 vào demo khách hàng hoặc yêu cầu full color rebrand Admin App. Việc đó cần kế hoạch monorepo/custom image riêng.
8. Thay Compose name/volume sẽ tạo database trống hoặc làm mất dữ liệu demo hiện có.
9. Baseline build/auth không chạy và nguyên nhân nằm ngoài thay đổi setup standalone đã biết; không mở rộng sang sửa toàn bộ upstream.
10. Cần secret thật, domain, email thật, OAuth client hoặc reCAPTCHA key để tiếp tục. Không tự tạo, đoán hoặc commit credential.

Nếu gặp sai lệch không thuộc STOP condition: chọn phương án bảo thủ nhất, ghi vào `## Deviations`, tiếp tục và không mở rộng scope.

## 14. Rủi ro và phương án giảm thiểu

| Rủi ro | Giảm thiểu |
|---|---|
| Broad replace chữ `Medplum` làm hỏng imports/FHIR | Chỉ sửa ma trận user-facing; chạy audit phân loại `href/copy` với canonical URI. |
| Theme override làm hỏng semantic status | Override palette `blue`; giữ red/green/yellow; visual smoke nhiều trang. |
| Logo 655x807 bị méo trong square slot | Canvas/padding trong suốt, `object-fit: contain`, screenshot header/auth/mobile. |
| Get Started còn link ẩn hoặc icon external | Bỏ anchor khỏi DOM, kiểm tra DOM và `rg href=.*medplum`. |
| Runtime vẫn gọi cloud | Xóa Google script, localize env defaults, kiểm tra Network tab. |
| Git nested repo gây push sai | Chỉ thao tác trong `medplum-provider`, xác minh `git rev-parse --show-toplevel` trước push. |
| CI không tái lập vì lockfile bị ignore | Commit `package-lock.json`, dùng Node 22 và `npm ci`. |
| Admin vẫn mang brand cũ | Không đưa port 3002 vào demo, không link từ Provider và ghi rõ operator-only; chỉ remap host port vì port 3000 đang bị dự án khác sử dụng. |

## 15. Handoff report model phải trả về

Khi kết thúc, model triển khai phải báo theo mẫu:

1. Branch, commit list, PR URL.
2. Danh sách file thêm/sửa/xóa theo từng phase.
3. Kết quả từng command lint/test/build/compose.
4. Kết quả brand audit, danh sách canonical Medplum URI được giữ và lý do.
5. Screenshot paths/links desktop và mobile.
6. Network audit: host nào được gọi trong smoke flow.
7. Deviations và STOP conditions đã gặp.
8. Hạng mục ngoài phạm vi còn lại, đặc biệt Admin App/full backend routing.

## 16. Assumptions đã khóa

| Assumption/decision | Trạng thái | Điều làm nó mất hiệu lực |
|---|---|---|
| HyperS là tên bản demo | User-confirmed | User cung cấp tên sản phẩm mới. |
| `brand-mark.png` là logo đã duyệt | User-confirmed và file verified | User thay logo hoặc asset source không còn đọc được. |
| CSS landing page là nguồn màu chính | User-confirmed; token đã đọc trực tiếp | User cung cấp brand guideline mới. |
| App UI tiếp tục bằng tiếng Anh | User-confirmed | Yêu cầu i18n mới; cần plan riêng. |
| Demo khách hàng chỉ dùng Provider port 3001 | Decision-confirmed | Nếu Admin port 3002 phải customer-facing, kích hoạt STOP condition. |
| Link Medplum bị xóa; route/docs/support HyperS chưa có dùng `Coming soon` | Decision-confirmed | User cung cấp URL/route HyperS thật. |
| Vendor logo chỉ giữ khi định danh integration thực tế | Plan decision | Legal/brand team cấm một vendor asset cụ thể. |
| Rebrand không thay dữ liệu/clinical behavior | Non-negotiable | Bất kỳ yêu cầu behavior/schema mới nào cần task khác. |
| Registration vẫn hoạt động sau khi thay logo | Chưa verified do baseline auth tests bị `<Logo>` làm fail | Test/runtime sau tracer slice không pass; model phải dừng theo STOP condition nếu public API không cho override. |
| GitHub repo vẫn private/rỗng trước bootstrap | Verified ngày 2026-08-13, phải recheck khi triển khai | Remote có commit/owner/visibility mới. |

## 17. Plan review notes

Ngày review: 2026-08-13.

| Dimension | Trước review | Sau review | Resolution |
|---|---:|---:|---|
| Completeness | 4/5 | 5/5 | Thêm baseline failure handling, rollback/recovery và handoff report. |
| Feasibility | 4/5 | 5/5 | Xác minh build/Compose/Mantine API; phân loại chính xác lint và 14 test failures. |
| Scope | 4/5 | 5/5 | Cắt thay đổi Compose profile/Admin; giữ light-only, không thêm font/Playwright/multi-brand. |
| Testability | 5/5 | 5/5 | Có source audit, automated gates, runtime/network/visual smoke và done criteria. |
| Risk | 4/5 | 5/5 | Thêm rollback theo commit, volume safety và STOP conditions. |
| Assumptions | 4/5 | 5/5 | Mỗi assumption được đánh dấu confirmed/verified/unverified và có invalidation trigger. |

Load-bearing claims đã kiểm chứng:

- GitHub repo đích private/rỗng và auth đúng tài khoản: VERIFIED bằng `gh repo view`/`gh auth status`.
- Logo source tồn tại, transparent ARGB, `655 x 807`: VERIFIED từ file thực tế.
- Mantine 8.3.18 hỗ trợ `forceColorScheme`, custom `primaryColor` và `MantineColorsTuple`: VERIFIED từ installed type declarations.
- Baseline production build và Compose config pass: VERIFIED bằng command ngày review.
- Lint fail do thiếu flat config; package `@medplum/eslint-config` export `medplumEslintConfig`: VERIFIED từ error output và package source.
- Baseline test status `1.271/1.285` pass: VERIFIED; lỗi đã chia thành logo-dependent và bốn ESM-spy failures.

Residual blockers trước implementation: không có. Registration là điều kiện cần xác minh ngay ở tracer slice và đã có STOP condition rõ.

Tài liệu là handoff độc lập: model nhận việc không cần đọc lại conversation để biết source, brand reference, repository đích, phạm vi, file anchors, order of work, verification và STOP conditions.
