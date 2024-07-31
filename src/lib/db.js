import Dexie from 'dexie'

export const db = new Dexie('database')

db.version(1).stores({
    session: 'id, timestamp',
    chat: 'id, timestamp, sessionId',
    agent: 'id, timestamp, chatId',
    history: 'id, timestamp, sessionId'
})