import "./Skills.css";

function Skills() {

  const skills = [
    "Java",
    "React",
    "Aspiring In Spring Boot",
    "HTML",
    "CSS",
    "JavaScript",
    "SQL",
    "Git",
    "GitHub"
  ];

  return (

    <section className="skills">

      <h2>Technical Skills</h2>

      <div className="skill-container">

        {

          skills.map((skill,index)=>

            <div
              className="skill"
              key={index}
            >
              {skill}
            </div>

          )

        }

      </div>

    </section>

  );

}

export default Skills;