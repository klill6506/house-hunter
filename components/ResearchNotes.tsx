import { researchOf } from "../lib/research";
export default function ResearchNotes({ facts }: { facts: unknown }) {
  const { notes, highlights = [] } = researchOf(facts);
  if (!notes.length && !highlights.length) return null;
  return (
    <>
      {highlights.length > 0 && (
        <section
          className="researchNotes researchHighlights"
          aria-label="What stands out"
        >
          <strong>
            <span aria-hidden="true">✧ </span>What stands out
          </strong>
          <ul>
            {highlights.map((note, i) => (
              <li key={i}>
                {note.text}{" "}
                <a
                  href={note.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      {notes.length > 0 && (
        <div className="researchNotes">
          <strong>Worth checking</strong>
          {notes.map((note, i) => (
            <p key={i}>
              {note.text}{" "}
              <a
                href={note.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Source ↗
              </a>
            </p>
          ))}
        </div>
      )}
    </>
  );
}
