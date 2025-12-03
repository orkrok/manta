const journey = [
  {
    years: "2025.10 - Present",
    role: "Security Engineer / PaloAlot XDR",
    institution: "Cinamon",
  },
  {
    years: "2025.06 - 2025.09",
    role: "VDI Solution Engineer / Internship ",
    institution: "SOMANSA",
  },
  {
    years: "2024.12 - 2025.06",
    role: "KT 클라우드와 NHN 클라우도로 완성하는 클라우드 엔지니어 양성 과정",
    institution: "한국정보교육원",
  },
  {
    years: "2022 - 2023",
    role: "종자 및 유전자 검사",
    institution: "국립종자원 충남지원",
  },
  {
    years: "2019.02 - 2019.08",
    role: "Proficiency",
    institution: "Kaplan / 어학연수",
  },
  {
    years: "2015.03 - 2021.08",
    role: "Student",
    institution: "University of Kangwon / Bio-engineering",
  },
];

const Journey = () => {
  return (
    <div className="flex flex-col">
      <h2 className="h2 mb-8">
        Education & <span className="text-accent">Experience</span>
      </h2>
      {journey.map((item, index) => {
        const { institution, role, years } = item;
        return (
          <div key={index} className="flex items-center gap-12 w-full">
            {/* bullets */}
            <div className="flex flex-col w-max justify-center items-center">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <div className="w-[1px] h-[180px] bg-white/10"></div>
            </div>
            {/* text */}
            <div className="max-w-[500px]">
              <p className="mb-6 text-lg text-white/50">{years}</p>
              <h4 className="h4 mb-2">{role}</h4>
              <p className="text-lg text-white/50">{institution}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Journey;
