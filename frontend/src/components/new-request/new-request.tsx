import { FC, useState, useRef } from "react";
import styles from "./new-request.module.css";
import Button from "../button/button";
import { SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";

interface IRequest {
  closeModal: () => void;
  handleReloadData: () => void;
}

interface IForm {
  user: string;
  type: string;
  description: string;
}

const RequestNew: FC<IRequest> = ({ closeModal, handleReloadData }) => {
  const [droplistShow, setDroplistShow] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const filePicker = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IForm>({
    defaultValues: {
      type: "Ошибка",
    },
  });

  const inputValue = watch("type");
  const { description } = watch();

  const submit: SubmitHandler<IForm> = async (data) => {
    closeModal();
    try {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      const formattedDate = `${day}.${month}.${year}`;
      await axios.post("http://localhost:3001/messages", {
        ...data,
        date: formattedDate,
      });
      handleReloadData();
    } catch (error) {
      console.error("Error sending POST request:", error);
    }
  };

  const toggleDroplist = () => {
    setDroplistShow((prevState) => !prevState);
  };

  const handleClickItemList = (value: string) => {
    setValue("type", value);
    toggleDroplist();
  };

  const handleClickAddImage = () => {
    if (filePicker.current) {
      filePicker.current.click();
    }
  };

  const handleChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const resetFile = () => {
    setFileName(null);
    if (filePicker.current) {
      filePicker.current.value = "";
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)}>
      <fieldset
        className={
          errors?.user
            ? `${styles.fieldset} ${styles.fieldsetError}`
            : `${styles.fieldset}`
        }
      >
        <legend className={styles.legend}>Автор обращения</legend>
        <input
          type="text"
          {...register("user", {
            required: true,
            minLength: 3,
            pattern: /[А-Яа-я]/,
          })}
          className={styles.inputText}
          placeholder="Введите свое имя"
        />
      </fieldset>
      {errors?.user && errors.user.type === "pattern" && (
        <p className={styles.errorValidate}>Только русские символы</p>
      )}
      {errors?.user && errors.user.type !== "pattern" && (
        <p className={styles.errorValidate}>
          Поле обязательно к заполнению, минимальное количество символов 3
        </p>
      )}
      <fieldset className={`${styles.fieldset} ${styles.requestType}`}>
        <legend className={styles.legend}>Тип запроса</legend>
        <div className={styles.customSelect}>
          <button
            className={styles.buttonDpordown}
            onClick={toggleDroplist}
            type="button"
          >
            {inputValue}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="8"
              viewBox="0 0 13 8"
              fill="none"
              className={styles.arrow}
            >
              <path d="M0 0L6.5 8L13 0H0Z" fill="#6B7280" />
            </svg>
          </button>

          <ul
            className={
              droplistShow
                ? `${styles.dropList}`
                : `${styles.dropList} ${styles.dropdownHidden}`
            }
          >
            <li
              className={styles.dropListItem}
              onClick={() => handleClickItemList("Ошибка")}
            >
              Ошибка
            </li>
            <li
              className={styles.dropListItem}
              onClick={() => handleClickItemList("Новая функциональность")}
            >
              Новая функциональность
            </li>
            <li
              className={styles.dropListItem}
              onClick={() => handleClickItemList("Улучшение")}
            >
              Улучшение
            </li>
            <li
              className={styles.dropListItem}
              onClick={() => handleClickItemList("Документация")}
            >
              Документация
            </li>
          </ul>
          <input
            type="text"
            value={inputValue}
            {...register("type")}
            className={styles.dropdownHidden}
          />
        </div>
      </fieldset>
      <h3 className={styles.descriptionTitle}>Добавить описание</h3>
      <textarea
        {...register("description", {
          required: true,
          minLength: 5,
          pattern: /^[А-Яа-я0-9\s]+$/,
        })}
        name="description"
        id="description"
        placeholder="Введите описание запроса"
        className={
          errors?.description
            ? `${styles.textarea} ${styles.textareaErrorValidate}`
            : `${styles.textarea}`
        }
        value={description}
        onChange={(e) => setValue("description", e.target.value)}
      ></textarea>
      {errors?.description && errors.description.type === "pattern" && (
        <p className={styles.errorValidate}>Только русские символы и цифры</p>
      )}
      {errors?.description && errors.description.type !== "pattern" && (
        <p className={styles.errorValidate}>
          Поле обязательно к заполнению, минимальное количество символов 5
        </p>
      )}
      <h3 className={`${styles.descriptionTitle} ${styles.imageTitle}`}>
        Добавить изображение
      </h3>
      <div className={styles.addImage}>
        <input
          type="file"
          className={styles.inputAddImage}
          id="fileInput"
          ref={filePicker}
          accept="image/jpeg, image/png"
          onChange={handleChangeFile}
        />
        <button
          id="uploadButton"
          className={styles.buttonAddImage}
          style={{ backgroundImage: `url(/images/addImage.svg)` }}
          onClick={handleClickAddImage}
          type="button"
        ></button>
        {fileName && (
          <div className={styles.cancelFile}>
            <p className={styles.fileName}>Имя файла: {fileName}</p>
            <button
              className={styles.cross}
              style={{ backgroundImage: `url(/images/cross.svg)` }}
              onClick={resetFile}
            ></button>
          </div>
        )}
      </div>

      <div className={styles.buttons}>
        <Button text="Сохранить" />
        <Button text="Закрыть" type="button" onClick={closeModal} />
      </div>
    </form>
  );
};

export default RequestNew;
