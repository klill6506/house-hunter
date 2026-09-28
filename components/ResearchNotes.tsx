import { researchOf } from "../lib/research";
export default function ResearchNotes({ facts }: { facts: unknown }) {
  const notes = researchOf(facts).notes;
  if (!notes.length) return null;
  return (
    <div className="researchNotes">
      <strong>Worth checking</strong>
      {notes.map((note, i) => (
        <p key={i}>
          {note.text}{" "}
          <a href={note.sourceUrl} target="_blank" rel="noopener noreferrer">
            Source ↗
          </a>
        </p>
      ))}
    </div>
  );
}
