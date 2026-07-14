import { goals, skillGroups, type SkillLevel } from "../data/skills";
import "./styles/TechStackNew.css";
import "./styles/FloatingBubbleCard.css";

type SkillItem = {
  name: string;
  level: SkillLevel;
};

const allSkills: SkillItem[] = skillGroups.flatMap((group) =>
  group.items.map((name) => ({ name, level: group.level }))
);

const rowSizes = [5, 4, 3, 2];
const skillRows = rowSizes.map((size, index) => {
  const start = rowSizes.slice(0, index).reduce((sum, value) => sum + value, 0);
  return allSkills.slice(start, start + size);
});

const SkillsGoals = () => {
  return (
    <section className="techstack-new" id="skills">
      <div className="techstack-video-container" aria-hidden="true">
        <video autoPlay loop muted playsInline className="techstack-video">
          <source src="/video/video.webm" type="video/webm" />
        </video>
        <div className="techstack-overlay"></div>
      </div>

      <div className="techstack-content skills-goals-content">
        <h2>Skills &amp; Goals</h2>
        <div className="skill-levels" aria-label="Skill levels">
          {skillGroups.map((group) => (
            <p key={group.level}>
              <strong>{group.level}</strong> — {group.description}
            </p>
          ))}
        </div>

        <div className="techstack-pyramid" aria-label="Technical skills">
          {skillRows.map((row, rowIndex) => (
            <div key={rowIndex} className="techstack-row">
              {row.map((skill) => (
                <div key={skill.name} className="techstack-item skill-item floating-glass-card" title={`${skill.name} — ${skill.level}`}>
                  <span className="skill-mark" aria-hidden="true">{skill.name.slice(0, 2).toUpperCase()}</span>
                  <span>{skill.name}</span>
                  <small>{skill.level}</small>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="goals-grid">
          <article className="goal-column floating-glass-card">
            <p className="goal-kicker">Next steps</p>
            <h3>Short-term goals</h3>
            <ul>{goals.shortTerm.map((goal) => <li key={goal}>{goal}</li>)}</ul>
          </article>
          <article className="goal-column floating-glass-card">
            <p className="goal-kicker">Long view</p>
            <h3>Long-term goals</h3>
            <ul>{goals.longTerm.map((goal) => <li key={goal}>{goal}</li>)}</ul>
          </article>
        </div>
      </div>
    </section>
  );
};

export default SkillsGoals;
