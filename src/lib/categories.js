export const gigCategories = [
  {
    heading: "Web / App Development",
    categories: [
      "Front End",
      "Back End",
      "Full Stack",
      "CMS (Wordpress, Squarspace, etc.)",
      "E-Commerce",
      "Website Optimization",
      "Website Maintenance/Support",
      "Custom API Development",
      "Training/Documentation"
    ]
  },
  {
    heading: "Digital Marketing",
    categories: [
      "Marketing Flyers",
      "Ads",
      "Instagram Posts",
      "TikToks",
      "Youtube Shorts",
      "Social Media Management",
      "Email Marketing",
      "Content Writing"
    ]
  },
  {
    heading: "Graphic Design",
    categories: [
      "Logo Design",
      "Brand Design",
      "Icons",
      "Brand Graphics",
      "Digital Calligraphy",
      "UI/UX Design",
      "Print Design",
      "Packaging Design"
    ]
  },
  {
    heading: "AI and Machine Learning",
    categories: [
      "Consulting",
      "Model Development",
      "Data Analysis",
      "AI Integration",
      "Chatbot Development"
    ]
  },
  {
    heading: "Physical Services",
    categories: [
      "Home Repairs",
      "Plumbing",
      "Electrical Work",
      "Carpentry",
      "Painting",
      "Moving Services",
      "Cleaning Services",
      "Landscaping"
    ]
  },
  {
    heading: "Automotive",
    categories: [
      "Car Repair",
      "Oil Change",
      "Tire Services",
      "Brake Service",
      "Engine Repair",
      "Car Detailing",
      "Mobile Mechanic",
      "Diagnostic Services"
    ]
  },
  {
    heading: "Education & Tutoring",
    categories: [
      "Math Tutoring",
      "Science Tutoring",
      "Language Learning",
      "Test Preparation",
      "Music Lessons",
      "Art Classes",
      "Islamic History",
      "Beginner's Arabic",
      "Quran and Sunnah",
      "Hajj Prep",
      "Umrah Prep"
    ]
  },
  {
    heading: "Business Services",
    categories: [
      "Accounting",
      "Legal Services",
      "Business Consulting",
      "Tax Preparation",
      "Financial Planning",
      "Business Planning",
      "Market Research",
      "Halal Business Consulting"
    ]
  },
  {
    heading: "Health & Wellness",
    categories: [
      "Personal Training",
      "Nutrition Consulting",
      "Yoga Classes",
      "Meditation",
      "Physical Therapy",
      "Mental Health Support",
      "Fitness Training"
    ]
  },
  {
    heading: "Events & Entertainment",
    categories: [
      "Photography",
      "Videography",
      "Event Planning",
      "DJ Services",
      "Live Music",
      "Wedding Services",
      "Catering"
    ]
  }
];

// Function to get all unique categories as a flat array
export const getAllCategories = () => {
  return gigCategories.reduce((acc, group) => {
    return [...acc, ...group.categories];
  }, []);
};

// Function to validate if a category exists
export const isValidCategory = (category) => {
  return getAllCategories().includes(category);
}; 