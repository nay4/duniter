/**
 * Created by cgeek on 22/08/15.
 */

var Q = require('q');
var AbstractLoki = require('./AbstractLoki');

module.exports = SourcesDAL;

function SourcesDAL(fileDAL, loki) {

  "use strict";

  let collection = loki.getCollection('sources') || loki.addCollection('sources', { indices: ['pubkey', 'type', 'number', 'fingerprint', 'amount', 'block_hash'] });

  AbstractLoki.call(this, collection, fileDAL, {
    block_number: 'number',
    block_hash: 'block_hash'
  }, loki);

  this.idKeys = ['pubkey', 'type', 'number', 'fingerprint', 'amount'];
  this.metaProps = ['consumed'];

  this.init = () => null;

  this.getAvailableForPubkey = (pubkey) => this.lokiFind({
    pubkey: pubkey
  },{
    consumed: false
  });

  this.getSource = (pubkey, type, number) => this.lokiFindOne({
    $and: [
      { pubkey: pubkey },
      { type: type },
      { number: number }
    ]
  }, null, this.IMMUTABLE_FIELDS);

  this.isAvailableSource = (pubkey, type, number, fingerprint, amount) => {
    let src = this.lokiExisting({
      pubkey: pubkey,
      type: type,
      number: number,
      fingerprint: fingerprint,
      amount: amount
    });
    return Q(src ? !src.consumed : false);
  };

  this.consumeSource = (pubkey, type, number, fingerprint, amount) => {
    let src = this.lokiExisting({
      pubkey: pubkey,
      type: type,
      number: number,
      fingerprint: fingerprint,
      amount: amount
    });
    src.consumed = true;
    return this.lokiSave(src);
  };

  this.addSource = (state, pubkey, type, number, fingerprint, amount, block_hash) => this.lokiSave({
    pubkey: pubkey,
    type: type,
    number: number,
    fingerprint: fingerprint,
    amount: amount,
    block_hash: block_hash,
    consumed: false
  });
}