export default function page() {
  return (
    <div className="max-w-3xl mx-auto p-6 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-20 mt-10">
        Kontaktiere mich gerne bei Fragen oder Anmerkungen.
      </h1>
      <div className="text-lg mt-2 text-gray-900 flex flex-col items-center">
        <p>Gibt es eine Funktion,die noch fehlt?</p>
        <p>Hast du einen Bug gefunden?</p>
        <p>Ist eine Information nicht korrekt?</p>
        <p>Gibt es ein Tier, dass noch fehlt?</p>
        <p>
          {" "}
          Hast du ein gutes Foto, dass für eine Art im Lexikon verwendet werden
          kann?
        </p>
        <p className="mt-4">
          Melde dich gerne bei mir bei allen Problemen oder Anmerkungen.
        </p>
      </div>
      <form className="mt-6 flex flex-col gap-4">
        <input
          type="text"
          placeholder="Ihr Name"
          className="p-3 border border-gray-200 bg-gray-900 shadow-lg shadow-black rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-600 hover:text-green-600"
        />
        <input
          type="email"
          placeholder="Ihre E-Mail"
          className="p-3 border border-gray-200 bg-gray-900 shadow-lg shadow-black rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-600 hover:text-green-600"
        />
        <textarea
          placeholder="Ihre Nachricht"
          rows={5}
          className="p-3 border border-gray-200 bg-gray-900 shadow-lg shadow-black rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-600 hover:text-green-600"
        ></textarea>
        <button
          type="submit"
          className="bg-gray-900 text-white text-lg font-semibold py-3 shadow-lg shadow-black rounded-lg  hover:bg-gray-800 hover:text-green-600 cursor-pointer transition"
        >
          Senden
        </button>
      </form>
      <div className="flex flex-col items-center">
        <p className="text-gray-600 mt-6">
          Oder direkt per E-Mail:{" "}
          <a
            href="mailto:naturelog.de@gmail.com"
            className="text-gray-900 hover:text-green-600 active:text-green-600"
          >
            naturelog.de@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
