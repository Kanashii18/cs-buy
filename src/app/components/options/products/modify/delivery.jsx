import React, { useEffect } from 'react';

export default function DeliveryInput({ formData, handleInputChange }) {

    // Validar el tiempo según la unidad seleccionada
    const handleTimeValidation = (value) => {
        const timeValue = parseFloat(value);

        // Validar minutos: entre 5 y 60
        if (formData.deliveryUnit.type === 'minutes') {
            if (timeValue < 0) return 1;
            if (timeValue > 60) return 60;
        }

        // Validar horas: entre 1 y 24
        if (formData.deliveryUnit.type === 'hours') {
            if (timeValue < 1) return 1;
            if (timeValue > 24) return 24;
        }

        return value; // Retornar valor validado
    };

    // Limpiar el valor de `delivery` si no se selecciona `minutes` ni `hours`
    useEffect(() => {
        if (formData.deliveryUnit.type !== "minutes" && formData.deliveryUnit.type !== "hours") {
            handleInputChange("deliveryUnit", { ...formData.deliveryUnit, value: "" });
        }
    }, [formData.deliveryUnit.type]);

    // Actualizar el `handleInputChange` para diferenciar entre `type` y `value`
    const handleDeliveryUnitChange = (field, value) => {
        // Si es `type`, actualiza el `type` de deliveryUnit
        if (field === "type") {
            handleInputChange("deliveryUnit", { ...formData.deliveryUnit, type: value });
        }
        // Si es `value`, actualiza el `value` de deliveryUnit
        else if (field === "value") {
            handleInputChange("deliveryUnit", { ...formData.deliveryUnit, value: handleTimeValidation(value) });
        }
    };

    return (
        <div className="bg-[#131016] rounded-[4px] p-2 flex h-min justify-center items-center relative w-min h-full text-suboption">
            <div className="flex bg-[#131016] w-full h-full gap-4">
                <select
                        value={formData.deliveryUnit.type}
                        onChange={(e) => handleDeliveryUnitChange("type", e.target.value)}
                        className="bg-[#17121f] outline-none p-[0.4rem]"
                >
                        <option value="">Select Delivery Time</option>
                        <option value="instant">Instant</option>
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                </select>

                {formData.deliveryUnit.type === "instant" && (
                        <span className="flex items-center px-4">Instant</span>
                )}

                {(formData.deliveryUnit.type === "minutes" || formData.deliveryUnit.type === "hours") && (
                        <input
                            type="number"
                            placeholder={`Enter time in ${formData.deliveryUnit.type}`}
                            value={formData.deliveryUnit.value}
                            onChange={(e) => handleDeliveryUnitChange("value", e.target.value)}
                            className="p-[0.4rem]"
                            maxLength={5}
                            min={0}
                        />
                )}
            </div>
        </div>
    );
}
