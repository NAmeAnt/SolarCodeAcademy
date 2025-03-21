# Phân tích yêu cầu dự án SolarCode Academy

## Phân tích tham khảo từ CodePen

Sau khi xem xét tham khảo từ CodePen (https://codepen.io/jcoulterdesign/pen/ZxXbeP), tôi nhận thấy một số điểm quan trọng:

1. **Giao diện**:
   - Menu hành tinh bên trái với hình ảnh và tên hành tinh
   - Hiển thị chi tiết hành tinh ở giữa màn hình
   - Hiệu ứng glow cho các hành tinh tạo cảm giác không gian
   - Thiết kế tối giản với nền đen và các hành tinh nổi bật

2. **Tương tác**:
   - Chuyển động mượt mà khi chọn hành tinh
   - Zoom và di chuyển camera
   - Hiệu ứng chuyển đổi khi chọn hành tinh khác

3. **Kỹ thuật**:
   - CodePen sử dụng CSS thuần túy để tạo hiệu ứng 3D
   - Sử dụng radio buttons để xử lý tương tác
   - Sử dụng CSS transforms để tạo hiệu ứng 3D và chuyển động

## Chuyển đổi từ CSS sang Three.js

Để chuyển đổi từ CSS sang Three.js, cần thực hiện các bước sau:

1. **Thiết lập môi trường Three.js**:
   - Tạo scene, camera và renderer
   - Thiết lập controls để zoom và di chuyển camera
   - Tạo ánh sáng và hiệu ứng

2. **Tạo hành tinh và vệ tinh**:
   - Sử dụng SphereGeometry để tạo hành tinh và vệ tinh
   - Áp dụng texture và material phù hợp
   - Thêm hiệu ứng glow bằng cách sử dụng shader hoặc sprite

3. **Triển khai tương tác**:
   - Sử dụng Raycaster để xử lý tương tác nhấp chuột
   - Tạo animation cho camera khi chuyển đổi giữa các hành tinh
   - Hiển thị UI popup khi chọn vệ tinh

## Cải tiến và bổ sung

So với tham khảo từ CodePen, dự án SolarCode Academy sẽ có một số cải tiến và bổ sung:

1. **Cấu trúc dữ liệu phức tạp hơn**:
   - 7 lĩnh vực (hành tinh) thay vì các hành tinh thực tế
   - Mỗi hành tinh có 3 vệ tinh (ngôn ngữ lập trình)
   - Mỗi vệ tinh có lộ trình học với 5 module
   - Mỗi lộ trình có 2 nhánh gợi ý

2. **Tương tác phong phú hơn**:
   - Nhấp vào hành tinh: Camera tập trung vào hành tinh, hiển thị vệ tinh
   - Nhấp vào vệ tinh: Hiển thị bảng lộ trình học
   - Chuyển đến hành tinh khác qua nhánh gợi ý

3. **Giao diện bổ sung**:
   - Nút "Cài đặt" với checkbox "Hiển thị lộ trình"
   - Nút "Donate" với link đến Patreon

## Kết luận

Dự án SolarCode Academy sẽ kế thừa thiết kế và hiệu ứng đẹp mắt từ tham khảo CodePen, nhưng sẽ sử dụng Three.js để tạo trải nghiệm 3D thực sự và tương tác phong phú hơn. Cấu trúc dữ liệu và tương tác sẽ được thiết kế phù hợp với mục tiêu đào tạo lập trình, với các hành tinh đại diện cho lĩnh vực và vệ tinh đại diện cho ngôn ngữ lập trình.
