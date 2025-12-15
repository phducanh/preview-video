# Project Flow Documentation / Tài Liệu Luồng Chạy Dự Án

This document explains how the YouTube Loop Preview project works, from generating assets to rendering them on the frontend.

Tài liệu này giải thích cách hoạt động của dự án YouTube Loop Preview, từ việc tạo dữ liệu (assets) đến việc hiển thị trên giao diện (frontend).

---

## 1. Overview (Tổng quan)

The project aims to replicate the YouTube video preview feature (hovering over the progress bar to see a thumbnail). It consists of two main components:

1.  **Asset Generation**: Processing the raw video into sprite sheets (grids of thumbnails).
2.  **Preview Player**: A web player that calculates and displays the correct thumbnail based on cursor position.

Dự án mô phỏng tính năng xem trước video của YouTube (rê chuột vào thanh thời gian để xem ảnh thu nhỏ). Dự án gồm 2 thành phần chính:

1.  **Tạo dữ liệu**: Xử lý video gốc thành các tấm ảnh sprite (lưới các ảnh nhỏ).
2.  **Trình phát**: Giao diện web tính toán và hiển thị đúng ảnh thumbnail dựa trên vị trí chuột.

---

## 2. Asset Generation Flow (Luồng Tạo Dữ Liệu)

File: `generate.js`

### English

1.  **Input**: Takes `input.mp4` as the source video.
2.  **Configuration**: Defines 3 Levels of Detail (LOD) for the previews:
    - **L1 (Low)**: Small thumbnails (80px), large interval.
    - **L2 (Medium)**: Medium thumbnails (160px).
    - **L3 (High)**: Large thumbnails (320px).
3.  **Processing (FFmpeg)**:
    - The script loops through each level.
    - It executes an `ffmpeg` command to extract frames at a specific interval (e.g., every 5 seconds).
    - It scales the frames and tiles them into a grid (e.g., 5x5) to create a single "sprite sheet" image (e.g., `L2_M001.jpg`).
4.  **Output**:
    - Saves images to `public/assets/`.
    - Generates a `public/manifest.json` file containing metadata (grid size, dimensions, timing) for the frontend to use.

### Tiếng Việt

1.  **Đầu vào**: Sử dụng file `input.mp4` làm video gốc.
2.  **Cấu hình**: Định nghĩa 3 mức độ chi tiết (LOD):
    - **L1 (Thấp)**: Ảnh nhỏ (80px), khoảng cách thời gian xa nhau.
    - **L2 (Trung bình)**: Ảnh vừa (160px).
    - **L3 (Cao)**: Ảnh lớn (320px).
3.  **Xử lý (FFmpeg)**:
    - Script chạy vòng lặp qua từng mức độ (Level).
    - Chạy lệnh `ffmpeg` để trích xuất khung hình theo chu kỳ (ví dụ: mỗi 5 giây lấy 1 khung hình).
    - Thay đổi kích thước và ghép các khung hình thành một lưới (ví dụ: 5x5) để tạo ra một tấm ảnh "sprite sheet" duy nhất (ví dụ: `L2_M001.jpg`).
4.  **Đầu ra**:
    - Lưu ảnh vào thư mục `public/assets/`.
    - Tạo file `public/manifest.json` chứa thông tin metadata (kích thước lưới, kích thước ảnh, thời gian) để frontend sử dụng.

---

## 3. Frontend Visualization Flow (Luồng Hiển Thị Frontend)

File: `public/index.html`

### English

1.  **Initialization**:
    - The browser loads `index.html`.
    - Fetches `manifest.json` to understand the available preview levels and their specific configurations (grid columns/rows, image paths).
2.  **User Interaction (Hover)**:
    - User moves the mouse over the `.progress-container`.
    - Browser calculates the mouse position as a percentage (0% to 100%) and converts it to a video timestamp.
3.  **Coordinate Calculation (The "Magic")**:
    - **Sprite Selection**: Based on the timestamp and the interval (e.g., 5s), it calculates the global index of the frame. It determines which sprite sheet image to load (e.g., Sheet #1 or #2).
    - **Grid Position**: It calculates the specific `row` and `column` of the frame within the grid.
4.  **Rendering**:
    - The `.preview-box` element is displayed.
    - **Background Image**: Set to the URL of the calculated sprite sheet.
    - **Background Size**: Scaled so that each "cell" in the grid matches the display target size (160x90px). This allows swapping between Low/High quality sprites without changing the UI layout.
    - **Background Position**: Shifted negatively (e.g., `left: -160px`, `top: -90px`) to reveal only the specific grid cell needed through the "window" of the preview box.

### Tiếng Việt

1.  **Khởi tạo**:
    - Trình duyệt tải `index.html`.
    - Gọi file `manifest.json` để lấy thông tin về các mức độ preview có sẵn và cấu hình chi tiết (số hàng/cột, đường dẫn ảnh).
2.  **Tương tác người dùng (Hover)**:
    - Người dùng di chuột lên thanh `.progress-container`.
    - Trình duyệt tính toán vị trí chuột dưới dạng phần trăm (0% - 100%) và quy đổi ra thời gian video cụ thể.
3.  **Tính toán tọa độ (Phần quan trọng)**:
    - **Chọn ảnh Sprite**: Dựa vào thời gian và chu kỳ (ví dụ: 5s), tính ra số thứ tự của khung hình. Từ đó xác định cần tải tấm ảnh sprite nào (Tấm số 1 hay số 2).
    - **Vị trí trong lưới**: Tính toán xem khung hình đó nằm ở `hàng` nào, `cột` nào trong tấm ảnh sprite.
4.  **Hiển thị (Rendering)**:
    - Hiển thị khung `.preview-box`.
    - **Background Image**: Đặt đường dẫn đến tấm ảnh sprite vừa tính được.
    - **Background Size**: Tính toán lại kích thước ảnh nền sao cho mỗi "ô" trong lưới khớp với kích thước hiển thị (160x90px). Điều này giúp đổi giữa ảnh chất lượng Thấp/Cao mà không làm vỡ giao diện.
    - **Background Position**: Dịch chuyển ảnh nền (ví dụ: `left: -160px`, `top: -90px`) để chỉ lộ ra đúng ô lưới cần thiết qua "khung cửa sổ" preview box.
