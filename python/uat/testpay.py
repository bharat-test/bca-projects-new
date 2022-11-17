import requests
from requests.structures import CaseInsensitiveDict
url = "https://test.zoop.one/api/v1/in/financial/bav/lite"
headers = CaseInsensitiveDict()
headers["app-id"] = "618e324e8038f9001d5fdf7f"
headers["api-key"] = "QC93NV2-Y3V419Q-KPBF9W9-43Z80JT"
headers["Content-Type"] = "application/json"
ac_no=36361544872
ifsc_code="ICIC0000104"
data = """
    {
        "data": {
            "account_number": \""""+str(ac_no)+"""\",
            "ifsc": \""""+ifsc_code+"""\",
            "consent": "Y",
            "consent_text" : "I hear by declare my consent agreement for fetching my information via ZOOP API"

        }
    }
    """
#print(data)
resp = requests.post(url, headers=headers, data=data)

t=resp.text
print(resp.text)
print(t)
respdata=resp.json()
print(respdata['result']['beneficiary_name'])
print(respdata['result']['bank_ref_no'])