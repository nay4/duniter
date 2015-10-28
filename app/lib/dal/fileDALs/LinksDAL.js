/**
 * Created by cgeek on 22/08/15.
 */

var Q = require('q');
var AbstractLoki = require('./AbstractLoki');

module.exports = LinksDAL;

function LinksDAL(fileDAL, loki) {

  "use strict";

  let collection = loki.getCollection('links') || loki.addCollection('links', { indices: ['source', 'target', 'block_number', 'block_hash', 'timestamp'] });

  AbstractLoki.call(this, collection, fileDAL, {
    block_number: 'block_number',
    block_hash: 'block_hash'
  }, loki);

  this.idKeys = ['source', 'target', 'block_number', 'block_hash'];
  this.metaProps = ['obsolete'];

  this.init = () => null;

  this.getValidLinksFrom = (pubkey) => this.lokiFind({
    source: pubkey
  }, {
    obsolete: false
  });

  this.getValidLinksTo = (pubkey) => this.lokiFind({
    target: pubkey
  }, {
    obsolete: false
  });

  this.getObsoleteLinksFromTo = (from, to) => this.lokiFind({
    $and: [{
      source: from
    },{
      to: to
    }]
  }, {
    obsolete: true
  });

  this.obsoletesLinks = (minTimestamp) => {
    let toObsolete = this.lokiFind({
      timestamp: { $lte: minTimestamp }
    });
    for (let i = 0; i < toObsolete.length; i++) {
      let link = toObsolete[i];
      link.obsolete = true;
      collection.update(link);
    }
    return Q();
  };

  this.addLink = (link) => {
    link.obsolete = false;
    return this.lokiSave(link);
  };
}