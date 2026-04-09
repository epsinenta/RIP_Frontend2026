import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import Search from "../../components/InputField/InputField";
import DepartmentsList from "../../components/DepartmentsList/DepartmentsList";
import CartRow from "../../components/CartRow/CartRow";
import {
  departmentClipDescription,
  fallbackImageUrl,
  listDepartments,
  objectUrlFromKey,
} from "../../modules/departmentsApi";
import type { Department } from "../../modules/departmentsApi";
import { DEPARTMENTS_MOCK } from "../../modules/mock";
import { useDepartmentImageSearch } from "../../hooks/useDepartmentImageSearch";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setDepartmentTitleQuery } from "../../store/slices/departmentFilterSlice";
import { isTauriGuest } from "../../modules/appEnv";
import "./DepartmentsPage.css";

function resolveThumb(key: string): string {
  if (!key) return fallbackImageUrl();
  if (
    key.startsWith("http://") ||
    key.startsWith("https://") ||
    key.startsWith("/") ||
    key.startsWith("blob:")
  ) {
    return key;
  }
  return objectUrlFromKey(key);
}

export default function DepartmentsPage() {
  const dispatch = useAppDispatch();
  const searchTitle = useAppSelector((s) => s.departmentFilter.titleQuery);
  const [clipSourceDepartments, setClipSourceDepartments] = useState<Department[]>([]);
  const [displayDepartments, setDisplayDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [useMock, setUseMock] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [clipSessionActive, setClipSessionActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (useMock) {
        if (!cancelled) {
          setClipSourceDepartments(DEPARTMENTS_MOCK);
          setDisplayDepartments(DEPARTMENTS_MOCK);
        }
        return;
      }
      try {
        const data = await listDepartments();
        if (cancelled) return;
        if (data.length > 0) {
          setClipSourceDepartments(data);
          setDisplayDepartments(data);
        } else {
          setClipSourceDepartments(DEPARTMENTS_MOCK);
          setDisplayDepartments(DEPARTMENTS_MOCK);
          setUseMock(true);
        }
      } catch {
        if (cancelled) return;
        setClipSourceDepartments(DEPARTMENTS_MOCK);
        setDisplayDepartments(DEPARTMENTS_MOCK);
        setUseMock(true);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [useMock]);

  const clipItems = useMemo(
    () =>
      clipSourceDepartments.map((d) => ({
        id: d.department_id,
        description: departmentClipDescription(d),
      })),
    [clipSourceDepartments],
  );

  const {
    items: clipProcessed,
    imageEmbedding,
    workerError,
    searchByImage,
    resetSearch,
  } = useDepartmentImageSearch(clipItems, !isTauriGuest && clipSessionActive);

  const depById = useMemo(() => {
    const m = new Map<number, Department>();
    clipSourceDepartments.forEach((d) => m.set(d.department_id, d));
    return m;
  }, [clipSourceDepartments]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const filtered = await listDepartments({ title: searchTitle });

      if (filtered.length > 0) {
        setDisplayDepartments(filtered);
        setUseMock(false);
      } else {
        if (useMock) {
          const filteredMock = DEPARTMENTS_MOCK.filter((d) =>
            d.title.toLowerCase().includes(searchTitle.toLowerCase()),
          );
          setDisplayDepartments(filteredMock);
        } else {
          setDisplayDepartments([]);
        }
      }
    } catch {
      const filteredMock = DEPARTMENTS_MOCK.filter((d) =>
        d.title.toLowerCase().includes(searchTitle.toLowerCase()),
      );
      setDisplayDepartments(filteredMock);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadButtonClick = () => {
    if (!clipSessionActive) setClipSessionActive(true);
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (selectedImage?.startsWith("blob:")) URL.revokeObjectURL(selectedImage);
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      searchByImage(file);
    }
  };

  const handleClearImage = () => {
    if (selectedImage?.startsWith("blob:")) URL.revokeObjectURL(selectedImage);
    setSelectedImage(null);
    resetSearch();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const imageSearchActive = Boolean(imageEmbedding);
  const isUploadDisabled = clipItems.length === 0;
  const canResetImage = Boolean(selectedImage);

  const visibleClipRows = imageSearchActive
    ? clipProcessed.filter((item) => item.isVisible)
    : [];

  return (
    <div className="departments-page">
      <Search
        query={searchTitle}
        onQueryChange={(v) => dispatch(setDepartmentTitleQuery(v))}
        onSearch={handleSearch}
      />

      <div className="space">
        <main className="departments-page__main">
          {isTauriGuest ? null : <CartRow />}

          {isTauriGuest ? null : (
          <section
            className="departments-page__clip-search clip-search-section"
            aria-labelledby="clip-search-title"
          >
            <h2 id="clip-search-title" className="clip-search-section__heading">
              Поиск подразделения по изображению
            </h2>

            {workerError ? (
              <p className="clip-search-section__worker-msg" role="status">
                Не удалось загрузить модель или обработать запрос: {workerError}
              </p>
            ) : null}

            {clipItems.length === 0 ? (
              <p className="text-muted clip-search-section__empty-catalog">
                Загрузите каталог подразделений…
              </p>
            ) : (
              <div className="clip-search-section__panel">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="clip-search-section__file-input"
                  onChange={handleImageUpload}
                />

                <div className="clip-search-section__preview-wrap">
                  {selectedImage ? (
                    <img src={selectedImage} alt="" className="clip-search-section__preview-image" />
                  ) : (
                    <div className="clip-search-section__placeholder-image">Нет фото</div>
                  )}
                </div>

                <div className="clip-search-section__action-panel action-panel">
                  <Button
                    className="action-btn clip-search-section__btn-upload"
                    variant="warning"
                    onClick={handleUploadButtonClick}
                    disabled={isUploadDisabled}
                  >
                    Загрузить фото
                  </Button>

                  <Button
                    className="action-btn"
                    variant="outline-danger"
                    onClick={handleClearImage}
                    disabled={!canResetImage}
                  >
                    Сбросить
                  </Button>
                </div>
              </div>
            )}
          </section>
          )}

          {loading ? (
            <div>Загрузка...</div>
          ) : imageSearchActive ? (
            <div className="departments-page__grid departments-page__clip-results">
              {visibleClipRows.length === 0 ? (
                <div className="departments-page__empty">
                  Нет подразделений выше порога сходства. Попробуйте другое изображение.
                </div>
              ) : (
                <ul className="clip-results-list">
                  {visibleClipRows.map((item) => {
                    const d = depById.get(item.id);
                    if (!d) return null;
                    const thumb = resolveThumb(d.photo_url);
                    return (
                      <li key={item.id}>
                        <Link to={`/department/${item.id}`} className="furniture-row clip-result-row">
                          <img src={thumb} alt="" className="row-image" />
                          <div className="row-content">
                            <h5>{d.title}</h5>
                            <p className="text-muted mb-1 clip-result-row__en">{item.description}</p>
                            <p className="text-muted mb-0 small">{d.short_description}</p>
                          </div>
                          <div className="row-stats">
                            <div>
                              Сходство:{" "}
                              <span className="similarity-value">
                                {(item.score * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            <div className="services-grid departments-page__grid">
              {displayDepartments.length > 0 ? (
                <DepartmentsList departments={displayDepartments} />
              ) : (
                <div className="departments-page__empty">
                  {searchTitle
                    ? `По запросу «${searchTitle}» ничего не найдено`
                    : "Подразделения не найдены"}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
