"use client";

import { ChangeEvent, useState } from "react";
import styles from "./ImageConverter.module.css";
import { useSearchParams } from "next/navigation";

const formats = [
  "avif",
  "jpeg",
  "jpg",
  "jpe",
  "tile",
  "dz",
  "png",
  "raw",
  "tiff",
  "tif",
  "webp",
  "gif",
];

type statusType = "new" | "loading" | "finished" | "error" | "downloaded";

interface IItemFile {
  status: statusType;
  file: File;
  download?: string;
}

const ImageConverter = () => {
  const [selectedFiles, setSelectedFiles] = useState<IItemFile[]>([]);
  const [config, setConfig] = useState({
    from: "jpg",
    to: "png",
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files) {
      const files = e.target.files;

      const addFiles: IItemFile[] = [];

      for (let i = 0; i < files.length; i++) {
        if (files.item(i) !== null) {
          addFiles.push({
            file: files.item(i) as File,
            status: "new",
          });
        }
      }

      setSelectedFiles([...selectedFiles, ...addFiles]);
    }
  };

  const handleConversion = async (image: File, index: number) => {
    if (!image) {
      console.error("No se ha seleccionado ninguna imagen.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("format", config.to);
    updateStatus(index, "loading");

    try {
      const response = await fetch("/api/converter", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // La imagen fue procesada exitosamente
        // Puedes manejar la respuesta según sea necesario
        console.log("Imagen convertida con éxito.");

        // Crear una URL para el Blob y almacenarla en el estado
        const downloadUrl = URL.createObjectURL(await response.blob());
        updateStatus(index, "finished", downloadUrl);
      } else {
        // Manejar errores si la respuesta no es OK
        console.error("Error al convertir la imagen.");
        updateStatus(index, "error");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      updateStatus(index, "error");
      throw error;
    }
  };

  const convertAll = async () => {
    for (let i = 0; i < selectedFiles.length; i++) {
      if (selectedFiles[i].status !== "new") continue;
      await handleConversion(selectedFiles[i].file, i);
    }
  };

  const updateStatus = (
    index: number,
    status: statusType,
    downloadUrl?: string
  ) => {
    setSelectedFiles((prevSelectedFiles) => {
      const newArray = [...prevSelectedFiles];

      if (index !== -1 && index < newArray.length) {
        newArray[index] = { ...newArray[index], status, download: downloadUrl };
      } else {
        console.error(`Elemento con índice ${index} no encontrado.`);
      }

      return newArray;
    });
  };

  const deleteFileItem = (index: number) => {
    setSelectedFiles((prevSelectedFiles) =>
      prevSelectedFiles.filter((_, i) => i !== index)
    );
  };

  const handleDownload = (itemFile: IItemFile, index: number) => {
    const downloadLink = document.createElement("a");
    downloadLink.href = itemFile.download as string;
    downloadLink.download = `converted_${itemFile.file.name}`; // Puedes cambiar el nombre del archivo según sea necesario
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Revocar la URL después de la descarga
    URL.revokeObjectURL(itemFile.download as string);

    updateStatus(index, "downloaded");
  };

  return (
    <div style={{ width: "50%" }}>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <select
            defaultValue={config.from}
            onChange={(e) => {
              setConfig({ ...config, from: e.target.value });
            }}
          >
            {formats.map((format) => (
              <option key={format + "from"} value={format}>
                {format.toUpperCase()}
              </option>
            ))}
          </select>
          <div>TO</div>
          <select
            defaultValue={config.to}
            onChange={(e) => {
              setConfig({ ...config, to: e.target.value });
            }}
          >
            {formats.map((format) => (
              <option key={format + "to"} value={format}>
                {format.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.fileInputContainer}>
          <label className={styles.fileInputButton}>Seleccionar Archivos</label>
          <input
            type="file"
            multiple={true}
            accept={`.${config.from}`}
            onChange={handleImageChange}
            className={styles.fileInput}
          />
        </div>
      </div>

      <ul className={styles.fileList}>
        {selectedFiles.map((f, i) => (
          <li key={f.file.name + i}>
            <div>
              <p className={styles.fileName}>{f.file.name}</p>
            </div>
            <p>{f.file.type}</p>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => {
                  if (f.status === "new") {
                    handleConversion(f.file, i);
                  } else if (f.status === "finished" && f.download) {
                    handleDownload(f, i);
                  }
                }}
                disabled={f.status !== "new" && f.status !== "finished"}
                className={styles[f.status]}
              >
                {f.status === "loading" ? (
                  <span className={styles.loader}></span>
                ) : f.status === "finished" ? (
                  // Mostrar el enlace de descarga si está disponible
                  f.download ? (
                    `Download`
                  ) : (
                    "Finished"
                  )
                ) : f.status === "downloaded" ? (
                  "Downloaded"
                ) : f.status === "error" ? (
                  "Error"
                ) : (
                  "Convert"
                )}
              </button>
              <button
                onClick={() => {
                  deleteFileItem(i);
                }}
                className={styles.deleteButton}
              >
                X
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button style={{ marginTop: 50 }} onClick={convertAll}>
        Convertir Todo
      </button>
    </div>
  );
};

export default ImageConverter;
