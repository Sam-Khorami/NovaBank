import { BadRequestException, Injectable } from '@nestjs/common';
import axios from "axios";

@Injectable()
export class VitalRecordsService {

    private url: string;

    constructor () {

        this.url = "https://s.api.ir/api/sw1/ShahkarLite";

    }

    async isMatch (phoneNumber: string, nationalCode: string) {

        const payload = { mobile: phoneNumber, nationalCode: nationalCode }

        const request = await axios.post(this.url, payload, { headers: { "Content-Type": "application/json", Authorization: process.env.VITAL_RECORDS_API_KEY } });
        if (!request.data.data) throw new BadRequestException("Your phone number and national code are not match");

        return;

    }

}
