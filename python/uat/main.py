from dbr import *
from tkinter import *
from tkinter import filedialog
from pyaadhaar.utils import Qr_img_to_text, isSecureQr
from pyaadhaar.deocde import AadhaarSecureQr
from fpdf import FPDF
import base64
import requests
from requests.structures import CaseInsensitiveDict
import webbrowser
import mysql.connector
from tkinter import messagebox

license_key = "t0070fQAAALGnivMC5+WeR6a9s9vhk7fKxq36Q6PbVi/YJOH05kwm3HlVmKyRkuCxezgGdYH0L8P8UaNQeqE7lqmk5o+LZjsbjA=="
textqr =1
def pay(request_id,ac_no,ifsc_code):
    print("")
    mydb = mysql.connector.connect(
        host="mysql-58711-0.cloudclusters.net",
        user="admin",
        password="Passw0rd",
        database="aadhar",
        port="16498"
    )
    mycursor = mydb.cursor(buffered=True)
    sql = "update esign set ac_no=%s , ifsc=%s where request_id=%s"
    val = (ac_no,ifsc_code,request_id)
    mycursor.execute(sql, val)
    #mycursor.commit()
    url = "https://test.zoop.one/api/v1/in/financial/bav/lite"

    headers = CaseInsensitiveDict()
    headers["app-id"] = "618e324e8038f9001d5fdf7f"
    headers["api-key"] = "QC93NV2-Y3V419Q-KPBF9W9-43Z80JT"
    headers["Content-Type"] = "application/json"

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

    resp = requests.post(url, headers=headers, data=data)
    respdata = resp.json()
    print(respdata['result']['beneficiary_name'])
    print(respdata['result']['bank_ref_no'])
    #print(resp.text)
    messagebox.showinfo("done","1re credited to"+respdata['result']['beneficiary_name']+"with refrance no"+respdata['result']['bank_ref_no'])

def paydesign(request_id):
    print("")
    #ac_no = StringVar(window)
    #ifsc_code = StringVar(window)
    ac_no=919004941383
    ifsc_code="pytm0123456"
    user_name = Label(window,
                      text="Ac no.").place(x=40,
                                             y=100)

    # the label for user_password
    user_password = Label(window,
                          text="IFSC code").place(x=40,
                                                 y=130)

    submit_button = Button(window,
                           text="Submit",command=lambda: pay(request_id,ac_no,ifsc_code)).place(x=40,
                                                y=170)

    user_name_input_area = Entry(window,textvariable = ac_no,
                                 width=30).place(x=110,
                                                 y=95)

    user_password_entry_area = Entry(window,textvariable = ifsc_code,
                                     width=30).place(x=110,
                                                     y=115)

    #messagebox.showinfo("sudo","submited the values done")

def check(request_id):

    mydb = mysql.connector.connect(
        host="mysql-58711-0.cloudclusters.net",
        user="admin",
        password="Passw0rd",
        database="aadhar",
        port="16498"
    )
    print("req id = "+request_id)
    mycursor = mydb.cursor(buffered=True)
    sql = "select name,doc_url from esign where request_id = %s"
    mycursor.execute(sql, [(request_id)])
    results = mycursor.fetchall()
    if results:
        for i in results:
         print("success")
         messagebox.showinfo("success","dear"+str(results[0][0])+"your document has been successfulyy sign++ downlod it by url"+str(results[0][1]))
         paydesign(request_id)
         break
    else:
        sql = "select request_id,response_code from fail where request_id = %s"
        mycursor.execute(sql, [(request_id)])
        results = mycursor.fetchall()
        if results:
            for i in results:
             #print(results)
             print("user has not sign the agree with requestid="+results[0][0]+" reson response code=%"+str(results[0][1]))
             messagebox.showinfo("error++", "user has not sign the agree with requestid="+results[0][0]+" reson response code=%"+str(results[0][1]))

             break
        else:
          print("usr had not sign retry")
          messagebox.showinfo("error++", "usr had not sign retry click on button")

def calluidai():
   if(textqr==1):
      print("unable to detech qr -sudo retake")
      messagebox.showinfo("error++", "unable to detech qr -sudo retake")
   else:
    obj = AadhaarSecureQr(int(textqr))
    obj1=obj.decodeddata()
    obj.saveimage("filename.png")
    global uidaiphoto
    uidaiphoto = PhotoImage(file="filename.png")
    #print(obj1['name'])

    lable2 = Label(window,text=("yourname",str(obj1['name'])))
    lable2.pack()
    lable3 = Label(window,image=uidaiphoto).pack()
    #clear old text
    button.destroy()

    #create file

    global pdf
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=15)
    pdf.multi_cell(200,10,txt="i "+obj1['name']+" "+obj1['careof']+"me \nresdiding @"+obj1['house']+"\n"+obj1['landmark']+" \n"+obj1['location']+obj1['pincode']+"\n siging this with aadhar esign")
    pdf.image(name="filename.png")
    pdf.cell(200, 10, txt="document contract with Bharat project++ aadhar ending with"+obj1['adhaar_last_4_digit'])
    pdf.accept_page_break()
    pdf.close()
    pdf.output("out.pdf")

#file created
    #make pdf to base64
    with open("out.pdf", "rb") as pdf_file:
        base64string = base64.b64encode(pdf_file.read())
    #print(base64string)
    #now call
    url = "https://test.zoop.one/contract/esign/v4/aadhaar/init"
    headers = CaseInsensitiveDict()
    headers["app-id"] = "618e324e8038f9001d5fdf7f"
    headers["api-key"] = "QC93NV2-Y3V419Q-KPBF9W9-43Z80JT"
    headers["Content-Type"] = "application/json"
    data = """{
      \"document\": {
        \"data\": \""""+str(base64string.decode())+"""\",
        \"info\": \"information++\",
        \"sign\": [
          {
            \"page_num\": 0
           
          }
        ]
      },
      \"signer_name\": \""""+str(obj1['name'])+"""\",
      \"signer_email\": \"kiranpandiya18@gmail.com\",
      \"signer_city\": \""""+str(obj1['district'])+"""\",
      \"purpose\": \"testing\",
      \"response_url\": \"http://icici.gq/aadhar/webhooks.php\"
    }"""
   #data the data which has to sent

    #print(data)
    resp = requests.post(url, headers=headers, data=data)
    global respdata
    respdata=resp.json()
    request_id=respdata['request_id']
    print(respdata['request_id'])
    urlesign = 'http://icici.gq/aadhar/?req_id='+respdata['request_id']
    webbrowser.open_new(urlesign)

    checkbutton=Button(text="done doing esign",command=lambda: check(request_id)).pack()

def openFile():

   filePath= filedialog.askopenfilename()
   image = filePath
   reader = BarcodeReader()

   reader.init_license(license_key)
   try:
      text_results = reader.decode_file(image)
      if text_results != None:
         for text_result in text_results:
           ''' print("Barcode Format : ")
            print(text_result.barcode_format_string)
            print("Barcode Text : ")
            print(text_result.barcode_text)
            print("Localization Points : ")
            print(text_result.localization_result.localization_points)
            print("Exception : ")
            print(text_result.exception)
            print("-------------") '''
         global textqr
         textqr=text_result.barcode_text
         #print(textqr)

   except BarcodeReaderError as bre:
      print(bre)
   calluidai()

#idhar ilkha na hai upar function hai
window = Tk()
window.geometry("450x300")

lable1 = Label(window,text = "select aadhat image").pack()

button = Button(text="open",command=openFile)

button.pack()

window.mainloop()
