import { Web3Service } from './../web3.service';
import { Identity } from './../vault/identity';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VaultService } from './../vault/vault.service';
import * as IdentityContractData from './../../contracts/identity.js';

@Component({
  selector: 'app-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.css']
})
export class IdentityComponent implements OnInit {
  identity: Identity;
  balance: 0;
  allEvents = [];
  records: Record[] = new Array<Record>();

  constructor(
    private route: ActivatedRoute,
    private vault: VaultService,
    private web3Service: Web3Service
  ) { }

  ngOnInit() {
    this.identity = this.vault.getIdentity(this.route.snapshot.paramMap.get('address'));

    const identityContract = new this.web3Service.web3.eth.Contract(
      IdentityContractData.abi,
      this.identity.address,
      null
    );

    identityContract.events.allEvents(
      {
        fromBlock: 0,
        toBlock: 'latest'
      },
      (error, event) => {
        if (error) {
          throw new error(error);
        }
        this.allEvents.push(event);
      }
    );

    identityContract.methods.getRecordKeys().call().then(recordKeys => {
      for (const recordKey of recordKeys) {
        if (0 == recordKey) { continue; }
        this.records.push({
          key: this.web3Service.web3.utils.hexToUtf8(recordKey),
          value: identityContract.methods.getRecord(recordKey).call()
        });
      }
    });

    identityContract.getPastEvents(
      'allEvents',
      {fromBlock: 0, toBlock: 'latest'},
      (error, events) => {
        if (error) {
          throw new error(error);
        }
        this.allEvents = events;
      }
    );


  }
}

class Record {
  key: string;
  value: string;
}
