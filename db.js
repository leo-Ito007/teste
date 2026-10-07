// Gerenciador de Banco de Dados Local (IndexedDB) para Persistência Total
const LocalDB = {
  dbName: "LabEscolarDB",
  version: 1,
  db: null,

  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("cronograma")) {
          db.createObjectStore("cronograma", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("usuarios")) {
          db.createObjectStore("email", { keyPath: "email" });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.popularDadosIniciais().then(resolve);
      };

      request.onerror = (event) => reject(event.target.error);
    });
  },

  async popularDadosIniciais() {
    const totalCronogramas = await this.getAll("cronograma");
    if (totalCronogramas.length === 0) {
      const dadosPadrao = [
        { id: 1, hora: "07:30 - 08:15", professor: "Profª Marta", info: "Biologia - 1º A", status: "ocupado" },
        { id: 2, hora: "08:15 - 09:00", professor: "Prof. Carlos", info: "História - 3º C", status: "ocupado" },
        { id: 3, hora: "09:15 - 10:00", professor: "Profª Ana", info: "Geografia - 2º B", status: "ocupado" },
        { id: 4, hora: "10:00 - 10:45", professor: "Nenhum", info: "Livre", status: "disponivel" }
      ];
      for (let item of dadosPadrao) {
        await this.save("cronograma", item);
      }
    }

    const adminMaster = "leonardo.salles.felipe@escola.pr.gov.br";
    const userExist = await this.get("usuarios", adminMaster);
    if (!userExist) {
      await this.save("usuarios", { email: adminMaster, role: "operador" });
    }
  },

  get(storeName, key) {
    return new Promise((resolve) => {
      const transaction = this.db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
  },

  getAll(storeName) {
    return new Promise((resolve) => {
      const transaction = this.db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
    });
  },

  save(storeName, item) {
    return new Promise((resolve) => {
      const transaction = this.db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  },

  delete(storeName, key) {
    return new Promise((resolve) => {
      const transaction = this.db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve(true);
    });
  }
};