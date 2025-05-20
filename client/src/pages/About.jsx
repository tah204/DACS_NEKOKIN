import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import HeroAbout from '../components/HeroAbout';

const careTopics = [
  {
    title: 'Đồng hành cùng bạn',
    content: 'Dịch vụ chăm sóc thú cưng NekoKin hiểu rằng thú cưng của bạn không thể diễn đạt bất cứ điều gì về cuộc sống hay triệu chứng của chúng. Vì vậy, chúng tôi bắt đầu bằng việc xây dựng mối quan hệ chặt chẽ giữa bác sĩ thú y và những người chủ. Sự thấu hiểu giữa bác sĩ thú y và chủ là điều cần thiết để phát triển một kế hoạch điều trị phù hợp. Các bác sĩ thú y của NekoKin là những chuyên gia về sức khỏe động vật, nhưng bạn mới là người hiểu rõ nhất về các bé. Do đó, ưu tiên hàng đầu của NekoKin là lắng nghe những người chủ vật nuôi và hợp tác chặt chẽ để cùng nhau mang đến cho những người bạn đồng hành thân yêu của mình một cuộc sống hạnh phúc và khỏe mạnh hơn.'
  },
  {
    title: 'Trung thực và minh bạch',
    content: 'Là cha mẹ của các bé, bạn hoàn toàn có quyền được minh bạch về mọi thứ liên quan đến chăm sóc y tế cho thú cưng của mình. Đó là lý do tại sao NekoKin muốn bạn tham gia vào mọi quyết định liên quan đến việc điều trị cho thú cưng của bạn. Chúng tôi tin rằng sự hợp tác này sẽ mang lại kết quả tốt nhất cho sức khỏe và hạnh phúc của những người bạn đồng hành thân yêu.'
  },
  {
    title: 'Mục tiêu',
    content: 'Thú y không chỉ là công việc kinh doanh của NekoKin. Sức khỏe và phúc lợi động vật là sứ mệnh và niềm đam mê của chúng tôi. Thú cưng của bạn là ưu tiên hàng đầu tại đây. Chúng tôi cam kết cung cấp đội ngũ bác sĩ thú y có trình độ chuyên môn cao cùng với đội ngũ nhân viên hỗ trợ chuyên nghiệp, nhằm đảm bảo thú cưng của bạn có được sức khỏe tốt nhất.'
  },
  {
    title: 'Cách tiếp cận phù hợp',
    content: 'Giúp bạn hiểu và điều chỉnh hành vi thú cưng, từ huấn luyện vệ sinh, giảm stress đến điều trị các hành vi không mong muốn.'
  }
];

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div>
      <HeroAbout />

      {/* Nội dung giới thiệu */}
      <section className="pt-3 pb-5" style={{ backgroundColor: '#fffaf4' }}>
        <div className="container">
          {/* Tiêu đề giữa 2 cột */}
          <div className="row justify-content-center">
            <div className="col-md-8">
              <h2 className="fw-bold text-center mb-4" style={{ fontFamily: 'Quicksand, sans-serif', color: '#0d2554', fontSize: '2.5rem' }}>Về chúng tôi</h2>
            </div>
          </div>

          {/* Nội dung chia đôi */}
          <div className="row mb-5">
            <div className="col-md-6">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-muted" style={{ lineHeight: '1.9', fontSize: '1.2rem' }}>
                  Thú cưng là một phần quan trọng như một thành viên gia đình của chúng ta. Vì vậy, khi thú cưng của chúng ta bị nhiễm bệnh, hiển nhiên chúng ta cũng muốn chúng được các chuyên gia tận tuỵ chăm sóc.
                </p>
                <p className="text-muted" style={{ lineHeight: '1.9', fontSize: '1.2rem' }}>
                  Chúng tôi thành lập NekoKin để đáp ứng nhu cầu cung cấp các dịch vụ chăm sóc sức khỏe và thú y đẳng cấp thế giới ở Đông Nam Á.
                </p>
              </motion.div>
            </div>
            <div className="col-md-6">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-muted" style={{ lineHeight: '1.9', fontSize: '1.2rem' }}>
                  Khi nói đến sức khỏe của thú cưng, chúng tôi áp dụng các tiêu chuẩn cao nhất mà bạn có thể tìm thấy ở các bệnh viện thú y tốt nhất ở Bắc Mỹ, Châu Âu và Úc.
                </p>
                <p className="text-muted" style={{ lineHeight: '1.9', fontSize: '1.2rem' }}>
                  Chúng tôi luôn coi trọng việc xây dựng mối quan hệ tin cậy và lâu dài với khách hàng. NekoKin tin rằng khách hàng sẽ hoàn toàn yên tâm khi giao thú cưng của mình cho chúng tôi.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Hình ảnh bên dưới nội dung */}
          <div className="row mb-5">
            <div className="col-12">
              <motion.img
                src="/images/about.jpg"
                alt="Giới thiệu NekoKin"
                className="img-fluid rounded shadow d-block mx-auto"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>

          {/* Sứ mệnh và Giá trị */}
          <div className="row align-items-center mb-5">
            <div className="col-md-6">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9 }}
              >
                <h2 className="fw-bold mb-4 text-start" style={{ fontFamily: 'Quicksand, sans-serif', color: '#0d2554' }}>Sứ mệnh & Giá trị</h2>
                <ul className="text-muted text-start" style={{ lineHeight: '1.9', fontSize: '1.5rem' }}>
                  <li>Luôn đặt lợi ích của thú cưng lên hàng đầu.</li>
                  <li>Cung cấp sản phẩm được chọn lọc kỹ lưỡng.</li>
                  <li>Chia sẻ kiến thức chuyên sâu từ đội ngũ bác sĩ thú y.</li>
                  <li>Phát triển cộng đồng yêu thú cưng văn minh.</li>
                </ul>
              </motion.div>
            </div>

            <div className="col-md-6">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9 }}
              >
                <img
                  src="/images/Cat Kitty GIF.gif" // 👉 bạn thay link ảnh ở đây
                  alt="Sứ mệnh NekoKin"
                  className="img-fluid rounded shadow"
                />
              </motion.div>
            </div>
          </div>


          {/* Chăm sóc sức khoẻ toàn diện */}
          <div className="text-center text-md-start">
            <h2 className="fw-bold mb-5 text-center" style={{ fontFamily: 'Quicksand, sans-serif', color: '#0d2554', fontSize: '2.75rem' }}>Chăm sóc sức khoẻ toàn diện</h2>
            <div className="row">
              <div className="col-md-4 mb-4 mb-md-0">
                <ul className="list-unstyled ps-md-3">
                  {careTopics.map((topic, index) => (
                    <li
                      key={index}
                      className="py-2"
                      style={{
                        cursor: 'pointer',
                        fontWeight: index === selectedIndex ? 'bold' : 'normal',
                        color: index === selectedIndex ? '#8B0000' : '#333',
                        textAlign: 'left',
                        fontSize: '1.8rem',
                        borderLeft: index === selectedIndex ? '4px solid #8B0000' : '4px solid transparent',
                        paddingLeft: '12px'
                      }}
                      onClick={() => setSelectedIndex(index)}
                    >
                      {topic.title}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-md-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="border-0 p-4 bg-white"
                  >
                    <p className="text-muted" style={{ lineHeight: '1.8', fontSize: '1.25rem' }}>{careTopics[selectedIndex].content}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="text-center mt-5">
            <Link to="/home" className="btn btn-lg" style={{ backgroundColor: '#8B0000', color: '#fff' }}>
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;