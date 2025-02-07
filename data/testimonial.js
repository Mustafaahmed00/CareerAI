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
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-black">
          Success Stories
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
                  {item.focus}
                </span>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-6">"{item.quote}"</p>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold text-black">{item.author}</h3>
                <p className="text-sm text-gray-600">{item.role}</p>
                <p className="text-sm text-gray-500">{item.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}