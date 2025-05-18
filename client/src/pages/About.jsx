import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  const handleLinkClick = () => {
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="about-section py-5 bg-light">
      <div className="container">
        {/* Tiêu đề chính */}
        <h2 className="text-center mb-5">Giới thiệu về NekoKin</h2>

        {/* Ảnh giới thiệu */}
        <div className="row mb-5">
          <div className="col-12 text-center">
            <img
              src="/images/about.jpg"
              alt="Giới thiệu NekoKin"
              className="img-fluid rounded shadow"
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Nội dung giới thiệu */}
        <div className="about-content">
          {/* Chào mừng */}
          <div className="row mb-5">
            <div className="col-12">
              <h3 className="text-center mb-4">Chào mừng bạn đến với NekoKin</h3>
              <p className="text-muted">
                NekoKin là một website dành riêng cho những người yêu thú cưng, đặc biệt là mèo và chó. Chúng tôi cung cấp các sản phẩm chất lượng cao như thức ăn dinh dưỡng, đồ chơi an toàn, và phụ kiện thời trang để đảm bảo thú cưng của bạn luôn khỏe mạnh, vui vẻ và tràn đầy năng lượng. Không chỉ dừng lại ở việc bán hàng, NekoKin còn là nơi chia sẻ kiến thức và kinh nghiệm chăm sóc thú cưng thông qua các bài viết chuyên sâu, giúp bạn trở thành một người chủ tận tâm và chu đáo.
              </p>
            </div>
          </div>

          {/* Lịch sử hình thành */}
          <div className="row mb-5">
            <div className="col-12">
              <h3 className="text-center mb-4">Lịch sử hình thành</h3>
              <p className="text-muted">
                NekoKin được thành lập vào năm 2020 bởi một nhóm những người yêu thú cưng, với mục tiêu xây dựng một cộng đồng đáng tin cậy cho những người nuôi mèo và chó tại Việt Nam. Từ những ngày đầu tiên chỉ là một cửa hàng nhỏ cung cấp thức ăn cho thú cưng, chúng tôi đã không ngừng mở rộng và phát triển để trở thành một trong những website hàng đầu về chăm sóc thú cưng. Đến nay, NekoKin đã phục vụ hơn 50.000 khách hàng trên toàn quốc, với hàng ngàn sản phẩm và bài viết hữu ích được cập nhật thường xuyên.
              </p>
            </div>
          </div>

          {/* Sứ mệnh */}
          <div className="row mb-5">
            <div className="col-12">
              <h3 className="text-center mb-4">Sứ mệnh của chúng tôi</h3>
              <p className="text-muted">
                Chúng tôi mong muốn mang đến những thông tin hữu ích và sản phẩm tốt nhất để giúp bạn chăm sóc thú cưng một cách dễ dàng và hiệu quả. NekoKin không chỉ là nơi mua sắm, mà còn là người bạn đồng hành đáng tin cậy trên hành trình yêu thương và chăm sóc bạn bè bốn chân của bạn. Chúng tôi cam kết cung cấp các sản phẩm đã được kiểm định chất lượng, cùng với các bài viết chia sẻ kinh nghiệm được viết bởi đội ngũ chuyên gia, để đảm bảo thú cưng của bạn luôn được yêu thương và chăm sóc một cách khoa học nhất.
              </p>
            </div>
          </div>

          {/* Đội ngũ */}
          <div className="row mb-5">
            <div className="col-12">
              <h3 className="text-center mb-4">Đội ngũ của NekoKin</h3>
              <p className="text-muted">
                Đội ngũ của NekoKin bao gồm các chuyên gia về thú y, các nhà dinh dưỡng động vật, và những người yêu thú cưng giàu kinh nghiệm. Chúng tôi tự hào có đội ngũ tư vấn viên luôn sẵn sàng hỗ trợ bạn 24/7, giải đáp mọi thắc mắc từ cách chọn thức ăn phù hợp, cách huấn luyện thú cưng, đến cách xử lý các vấn đề sức khỏe thường gặp. Mỗi thành viên của NekoKin đều làm việc với niềm đam mê và trách nhiệm để mang lại trải nghiệm tốt nhất cho bạn và thú cưng của bạn.
              </p>
            </div>
          </div>

          {/* Giá trị cốt lõi */}
          <div className="row mb-5">
            <div className="col-12">
              <h3 className="text-center mb-4">Giá trị cốt lõi</h3>
              <p className="text-muted mb-3">
                Tại NekoKin, chúng tôi hoạt động dựa trên ba giá trị cốt lõi:
              </p>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <strong>Chất lượng:</strong> Mọi sản phẩm đều được chọn lọc kỹ càng, đảm bảo an toàn và phù hợp với nhu cầu của thú cưng.
                </li>
                <li className="list-group-item">
                  <strong>Kiến thức:</strong> Cung cấp thông tin chính xác, khoa học thông qua các bài viết được viết bởi chuyên gia.
                </li>
                <li className="list-group-item">
                  <strong>Tận tâm:</strong> Luôn đặt lợi ích của khách hàng và thú cưng lên hàng đầu, với dịch vụ hỗ trợ chu đáo và tận tình.
                </li>
              </ul>
            </div>
          </div>

          {/* Tại sao chọn NekoKin */}
          <div className="row mb-5">
            <div className="col-12">
              <h3 className="text-center mb-4">Tại sao chọn NekoKin?</h3>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Sản phẩm đa dạng, chất lượng cao, an toàn cho thú cưng.</li>
                <li className="list-group-item">Bài viết chia sẻ kinh nghiệm được viết bởi các chuyên gia.</li>
                <li className="list-group-item">Hỗ trợ tư vấn chăm sóc thú cưng 24/7.</li>
                <li className="list-group-item">Chính sách đổi trả minh bạch, giao hàng nhanh chóng trên toàn quốc.</li>
                <li className="list-group-item">Cộng đồng yêu thú cưng lớn mạnh, nơi bạn có thể kết nối và chia sẻ kinh nghiệm với những người cùng sở thích.</li>
              </ul>
            </div>
          </div>

          {/* Kêu gọi hành động */}
          <div className="row mb-5">
            <div className="col-12">
              <h3 className="text-center mb-4">Hãy cùng NekoKin chăm sóc thú cưng của bạn!</h3>
              <p className="text-muted">
                Nếu bạn đang tìm kiếm một nơi đáng tin cậy để mua sắm và tìm hiểu về chăm sóc thú cưng, NekoKin chính là lựa chọn hoàn hảo dành cho bạn. Hãy khám phá các sản phẩm và bài viết của chúng tôi ngay hôm nay, và cùng chúng tôi tạo nên một cuộc sống tốt đẹp hơn cho những người bạn bốn chân của bạn!
              </p>
            </div>
          </div>

          {/* Nút quay lại */}
          <div className="text-center">
            <Link
              to="/home"
              className="btn btn-primary btn-lg"
              onClick={handleLinkClick}
            >
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;