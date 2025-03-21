// Cập nhật file data.js để tải dữ liệu từ file JSON
const solarCodeData = {
  Fields: [],
  Languages: [],
  LearningPaths: [],
  Modules: [],
  Branches: []
};

// Hàm để tải dữ liệu từ file JSON
async function loadData() {
  try {
    const response = await fetch('data/solarcode_data.json');
    const data = await response.json();
    console.log("Dữ liệu đã được tải thành công");
    return data;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
    return solarCodeData; // Trả về dữ liệu mẫu nếu có lỗi
  }
}

// Export dữ liệu để sử dụng trong app.js
window.solarCodeData = solarCodeData;
window.loadData = loadData;
