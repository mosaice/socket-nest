import Datastore from 'nedb';

export const db = new Datastore({
  filename: 'db/message.db',
  autoload: true
});
