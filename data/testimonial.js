import React from 'react';

const testimonials = [
  {
    quote: "CareerAI's resume analysis revealed gaps in my skills I hadn't noticed. The personalized learning recommendations helped me fill those gaps.",
    author: "Alex Morgan",
    role: "Data Scientist",
    company: "AI Research Institute",
    focus: "Skills Development"
  },
  {
    quote: "The mock interview practice helped me identify areas where I needed improvement. The real-time feedback was invaluable.",
    author: "Jordan Lee",
    role: "Backend Developer",
    company: "Cloud Solutions",
    focus: "Interview Preparation"
  },
  {
    quote: "The industry insights helped me understand which certifications would be most valuable for my career path.",
    author: "Taylor Smith",
    role: "DevOps Engineer",
    company: "TechOps Inc",
    focus: "Career Planning"
  }
];

export default function Testimonials() {
    return (
      <section className="w-full py-12 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Success Stories
          </h2>
          
          <div className="testimonials-grid">
            {testimonials.map((item, index) => (
              <div
                key={index}
                className="testimonial-card"
              >
                <div className="mb-4">
                  <span className="testimonial-focus">
                    {item.focus}
                  </span>
                </div>
                
                <p className="testimonial-quote">
                  "{item.quote}"
                </p>
                
                <div className="border-t pt-4">
                  <h3 className="testimonial-author">
                    {item.author}
                  </h3>
                  <p className="testimonial-role">
                    {item.role}
                  </p>
                  <p className="testimonial-company">
                    {item.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }