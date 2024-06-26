import { FC, useCallback, useEffect, useState } from "react";
import styles from "./table.module.css";
import Button from "../button/button";
import { IMessage } from "../../types/types";
import { useMessagesStore } from "../../services/store";
import { useModal } from "../../hooks/useModal";
import Modal from "../modal/modal";
import MessageInfo from "../message-info/message-info";
import RequestNew from "../new-request/new-request";

interface ITable {
  handleReloadData: () => void;
}

const Table: FC<ITable> = ({ handleReloadData }) => {
  
  const { messages } = useMessagesStore();

  const [requestData, setRequestData] = useState<IMessage[]>(messages);
  const [currentPage, setCurrentPage] = useState(1);
  const [authorFilter, setAuthorFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentMessage, setCurrentMessage] = useState<IMessage | null>(null);
  const [sortBy, setSortBy] = useState<keyof IMessage | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const {
    isModalOpen: isModalOpenInfo,
    openModal: openModalInfo,
    closeModal: closeModalInfo,
  } = useModal();

  const {
    isModalOpen: isModalOpenRequest,
    openModal: openModalRequest,
    closeModal: closeModalRequest,
  } = useModal();

  useEffect(() => {
    if (messages && messages.length > 0) {
      setRequestData(messages);
    }
    setRequestData(messages);
  }, [messages]);

  const filterData = useCallback(() => {

    let filteredData = messages.slice();

    if (authorFilter) {
      filteredData = filteredData.filter((item) => item.user === authorFilter);
    }

    if (dateFilter) {
      filteredData = filteredData.filter((item) => item.date === dateFilter);
    }

    if (statusFilter) {
      filteredData = filteredData.filter(
        (item) => item.status === statusFilter
      );
    }

    if (typeFilter) {
      filteredData = filteredData.filter((item) => item.type === typeFilter);
    }

    if (sortBy) {
      filteredData.sort((a, b) => {
        if (sortBy === "id") {
          return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
        } else {
          return sortOrder === "asc"
            ? a[sortBy].localeCompare(b[sortBy])
            : b[sortBy].localeCompare(a[sortBy]);
        }
      });
    }

    setRequestData(filteredData);
    setCurrentPage(1);
  }, [authorFilter, dateFilter, messages, sortOrder, sortBy, statusFilter, typeFilter]);

  useEffect(() => {
    filterData();
  }, [filterData]);

  const pageSize = 12;

  const totalPage = Math.ceil(requestData.length / pageSize);

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return requestData.slice(startIndex, endIndex);
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => {
      const prevPageValue = prevPage - 1;
      return prevPageValue >= 1 ? prevPageValue : prevPage;
    });
  };

  const nextPage = () => {
    setCurrentPage((prevPage) => {
      const nextPageValue = prevPage + 1;
      return nextPageValue <= totalPage ? nextPageValue : prevPage;
    });
  };

  const filterReset = () => {
    setRequestData(messages);
    setCurrentPage(1);
    setAuthorFilter("");
    setDateFilter("");
    setStatusFilter("");
    setTypeFilter("");
  };

  const handleClickLink = (el: IMessage) => {
    openModalInfo();
    setCurrentMessage(el);
  };

  const handleSort = (column: string) => {
    if (Object.keys(messages[0]).includes(column)) {
      setSortBy(column as keyof IMessage);
      setSortOrder(sortBy === column && sortOrder === "asc" ? "desc" : "asc");
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <Button text="Новый запрос" onClick={openModalRequest} />
        <p className={styles.pagination}>
          {currentPage} из {totalPage}
        </p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="14"
          viewBox="0 0 60 14"
          fill="none"
        >
          <path
            onClick={prevPage}
            className={styles.back}
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.89779 11.9514L3.75524 6.76492L8.89779 1.57848L7.33267 0L0.625 6.76492L7.33267 13.5298L8.89779 11.9514Z"
            fill="#6B7280"
          />
          <path
            onClick={nextPage}
            className={styles.next}
            fillRule="evenodd"
            clipRule="evenodd"
            d="M51.6035 12.1745L56.7461 7.10085L51.6035 1.91442L53.1686 0.335938L59.8763 7.10085L53.1686 13.8658L51.6035 12.1745Z"
            fill="#6B7280"
          />
        </svg>
      </div>
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr className={styles.tableString}>
            <th onClick={() => handleSort("id")} className={styles.tableSort}>Номер запроса</th>
            <th onClick={() => handleSort("type")} className={styles.tableSort}>Тип запроса</th>
            <th>Описание</th>
            <th onClick={() => handleSort("user")} className={styles.tableSort}>Пользователь</th>
            <th onClick={() => handleSort("date")} className={styles.tableSort}>Дата</th>
            <th onClick={() => handleSort("status")} className={styles.tableSort}>Статус</th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {getCurrentPageData().map((el: IMessage, index: number) => (
            <tr key={index} className={styles.tableString}>
              <td>
                <button
                  className={styles.tableNumber}
                  onClick={() => handleClickLink(el)}
                >
                  {el.id}
                </button>
              </td>
              <td
                className={styles.type}
                onClick={() => setTypeFilter(el.type)}
              >
                <span
                  className={
                    el.type === "Ошибка"
                      ? `${styles.error} ${styles.td}`
                      : el.type === "Новая функциональность"
                      ? `${styles.colorGreen} ${styles.td}`
                      : el.type === "Улучшение"
                      ? `${styles.colorYellow} ${styles.td}`
                      : `${styles.td} ${styles.colorBlue}`
                  }
                >
                  {el.type}
                </span>
              </td>
              <td>
                <p
                  className={styles.subtitle}
                  onClick={() => handleClickLink(el)}
                >
                  {el.description}
                </p>
              </td>
              <td
                className={styles.user}
                onClick={() => setAuthorFilter(el.user)}
              >
                {el.user}
              </td>
              <td
                className={styles.date}
                onClick={() => setDateFilter(el.date)}
              >
                {el.date}
              </td>
              <td onClick={() => setStatusFilter(el.status)}>
                <span
                  className={
                    el.status === "В работе"
                      ? `${styles.status} ${styles.colorBlue}`
                      : el.status === "Выполнено"
                      ? `${styles.status} ${styles.colorGreen}`
                      : `${styles.status} ${styles.colorYellow}`
                  }
                >
                  {el.status}
                </span>
              </td>
            </tr>
          ))}
          {Array.from({ length: 12 - getCurrentPageData().length }).map(
            (_, index) => (
              <tr
                key={index + getCurrentPageData().length}
                className={styles.tableString}
              >
                <td>
                  <button className={styles.tableNumber}></button>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            )
          )}
        </tbody>
      </table>
      <div className={styles.footer}>
        <Button text="Сбросить фильтрацию" onClick={filterReset} />

        {authorFilter && (
          <div className={`${styles.filterItem} ${styles.normal}`}>
            <p className={styles.tag}>{authorFilter}</p>
            <img
              src="/images/cross.svg"
              alt="Сбросить фильтр"
              className={styles.cross}
              onClick={() => setAuthorFilter("")}
            />
          </div>
        )}
        {dateFilter && (
          <div className={`${styles.filterItem} ${styles.normal}`}>
            <p className={styles.tag}>{dateFilter}</p>
            <img
              src="/images/cross.svg"
              alt="Сбросить фильтр"
              className={styles.cross}
              onClick={() => setDateFilter("")}
            />
          </div>
        )}
        {statusFilter && (
          <div
            className={
              statusFilter === "В работе"
                ? `${styles.filterItem} ${styles.colorBlue}`
                : statusFilter === "Выполнено"
                ? `${styles.filterItem} ${styles.colorGreen}`
                : `${styles.filterItem} ${styles.colorYellow}`
            }
          >
            <p className={styles.tag}>{statusFilter}</p>
            <img
              src="/images/cross.svg"
              alt="Сбросить фильтр"
              className={styles.cross}
              onClick={() => setStatusFilter("")}
            />
          </div>
        )}
        {typeFilter && (
          <div
            className={
              typeFilter === "Новая функциональность"
                ? `${styles.filterItem} ${styles.colorGreen}`
                : typeFilter === "Ошибка"
                ? `${styles.filterItem} ${styles.error}`
                : typeFilter === "Улучшение"
                ? `${styles.filterItem} ${styles.colorYellow}`
                : `${styles.filterItem} ${styles.colorBlue}`
            }
          >
            <p className={styles.tag}>{typeFilter}</p>
            <img
              src="/images/cross.svg"
              alt="Сбросить фильтр"
              className={styles.cross}
              onClick={() => setTypeFilter("")}
            />
          </div>
        )}
      </div>

      {isModalOpenInfo && (
        <Modal onClosePopup={closeModalInfo}>
          <MessageInfo
            currentMessage={currentMessage}
            closeModal={closeModalInfo}
          />
        </Modal>
      )}

      {isModalOpenRequest && (
        <Modal onClosePopup={closeModalRequest}>
          <RequestNew
            closeModal={closeModalRequest}
            handleReloadData={handleReloadData}
          />
        </Modal>
      )}
    </div>
  );
};

export default Table;
