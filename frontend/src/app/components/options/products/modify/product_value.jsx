export default function Product_Value({ formData, setFormData }) {

    const handleAddAccount = () => {
        setFormData(prev => ({
            ...prev,
            accounts: [...prev.accounts, { information: "" }]
        }));
    };

    const handleContentChange = (index, newContent) => {
        const updatedAccounts = [...formData.accounts];
        updatedAccounts[index].information = newContent;
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
                                information: content,
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
            <div className="flex bg-[#131016] p-2 text-suboption">
                <div className="bg-[#17121f] w-full h-full">
                        <div className="flex flex-col justify-center items-center gap-4">
                            <div className="flex justify-around items-center w-full">
                                <h4>Set Account | {formData.accounts.length}</h4>

                                <div className="bg-[#262229] p-1 rounded-[2.3px]">
                                    <button className="bg-[#321c55] p-[0.2rem]">
                                            <div>
                                                <label htmlFor="json-file">
                                                    Add Json File
                                                </label>
                                                <input
                                                    type="file"
                                                    id="json-file"
                                                    accept=".json"
                                                    style={{ display: "none" }}
                                                    onChange={handleJsonFileChange}
                                                />
                                            </div>
                                    </button>
                                </div>

                                <div className="bg-[#262229] p-1 rounded-[2.3px]">
                                    <button className="bg-[#321c55] p-[0.2rem]" onClick={handleAddAccount} type="button">
                                            <div>
                                                <p>Add Account</p>
                                            </div>
                                    </button>
                                </div>
                            </div>

                            <div className="w-full px-2 pb-2 overflow-scroll max-h-[32rem] flex flex-col gap-4">
                                {formData.accounts.map((account, index) => (
                                    <div key={index} className="bg-[#1f1929] p-4 flex flex-col gap-2">
                                            <div className="bg-[#292138] w-min whitespace-nowrap py-[0.2rem] px-2 rounded-[12px] text-[0.88rem]">
                                                Account {account.id}
                                            </div>
                                            <div className="bg-[#292138] h-auto max-h-24 p-[0.3rem] overflow-scroll">
                                                <textarea
                                                    value={account.information}
                                                    onChange={(e) => handleContentChange(index, e.target.value)}
                                                    placeholder="Specify the email/password and the usage process."
                                                    className="[all:unset] whitespace-pre-wrap break-words w-full h-24 bg-[#321c55]"
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
