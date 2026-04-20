export default function Product_Value({ formData, setFormData }) {

    const handleAddAccount = () => {
        setFormData(prev => ({
            ...prev,
            accounts: [...prev.accounts, { content: "" }]
        }));
    };

    const handleContentChange = (index, newContent) => {
        const updatedAccounts = [...formData.accounts];
        updatedAccounts[index].content = newContent;
        setFormData(prev => ({ ...prev, accounts: updatedAccounts }));
    };

    const isValidValue = (value) => {
        return typeof value === 'string' || typeof value === 'number';
    };

    const handleJsonFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const jsonData = JSON.parse(reader.result);

                if (Array.isArray(jsonData)) {
                    const newAccounts = [];
                    let invalidObjectsCount = 0;

                    jsonData.forEach((account, index) => {
                        const validAccount = Object.entries(account)
                            .every(([key, value]) => isValidValue(value));

                        if (validAccount) {
                            const content = Object.entries(account)
                                .map(([key, value]) => `${key}: ${value}`).join("\n\n");
                            newAccounts.push({
                                id: newAccounts.length + 1,
                                content: content,
                            });
                        } else {
                            invalidObjectsCount++;
                        }
                    });

                    if (invalidObjectsCount > 0) {
                        alert('Algunos objetos no son válidos (no pueden contener objetos ni arrays dentro).');
                    }

                    setFormData(prev => ({ ...prev, accounts: newAccounts }));
                } else {
                    alert('El archivo JSON debe ser un array de objetos.');
                }
            } catch (error) {
                alert('Error al procesar el archivo JSON: ' + error.message);
            }
        };

        reader.readAsText(file);
    };

    return (
          <>
               <div className="product-value__div flex bg-[#131016] p-2">
                    <div className="product-value__layer bg-[#17121f] w-full h-full">
                         <div className="product-value__ flex flex-col justify-center items-center gap-4">
                              <div className="product-value__options flex justify-around items-center w-full text-suboption">
                                   <h4>Set Account | {formData.accounts.length}</h4>

                                   <div className="product-value__option1 value__option bg-[rgb(38,34,41)] p-1 rounded-[2.3px]">
                                        <button className="product_text__layer bg-[#321c55] p-[.2rem]" type="button">
                                             <div className="product_text__div">
                                                  <label htmlFor="json-file" className="product-text-label cursor-pointer">
                                                       Add Json File
                                                  </label>
                                                  <input
                                                       type="file"
                                                       id="json-file"
                                                       accept=".json"
                                                       className="hidden"
                                                       onChange={handleJsonFileChange}
                                                  />
                                             </div>
                                        </button>
                                   </div>

                                   <div className="product-value__option2 value__option bg-[rgb(38,34,41)] p-1 rounded-[2.3px]">
                                        <button
                                             className="product_text__layer bg-[#321c55] p-[.2rem]"
                                             onClick={handleAddAccount}
                                             type="button"
                                        >
                                             <div className="product_text__div">
                                                  <p>Add Account</p>
                                             </div>
                                        </button>
                                   </div>
                              </div>

                              <div className="product-value__content w-full px-2 pb-2 overflow-scroll max-h-[34rem] flex flex-col gap-4 no-scrollbar">
                                   {formData.accounts.map((account, index) => (
                                        <div className="product-value__content-layer bg-[#1f1929] p-4 flex flex-col gap-2" key={index}>
                                             <div className="product-value__quantity bg-[#292138] w-min whitespace-nowrap px-2 py-[.2rem] rounded-[12px] text-[.88rem]">
                                                  Account {account.id}
                                             </div>

                                             <div className="w-full bg-[#292138] h-auto max-h-[6rem] p-[.3rem] overflow-scroll no-scrollbar">
                                                  <textarea
                                                       value={account.content}
                                                       onChange={(e) => handleContentChange(index, e.target.value)}
                                                       placeholder="Specify the email/password and the usage process."
                                                       className="[all:unset] !block !w-full !box-border bg-[#321c55] !break-words h-[6rem]"
                                                  />
                                             </div>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    </div>
               </div>
          </>
     );
}
