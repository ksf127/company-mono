import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, type DictDataPayload, type DictTypePayload } from '../api';
import { Field } from '../components/Field';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import type { SysDictData, SysDictType } from '../types';
import { formatTime } from '../utils/format';
import { showToast } from '../utils/toast';

const TYPE_PAGE_SIZE = 8;

interface TypeForm {
  dictName: string;
  dictType: string;
  status: string;
  remark: string;
}

interface DataForm {
  dictLabel: string;
  dictValue: string;
  dictSort: string;
  listClass: string;
  isDefault: string;
  status: string;
  remark: string;
}

function emptyTypeForm(): TypeForm {
  return { dictName: '', dictType: '', status: '0', remark: '' };
}

function emptyDataForm(): DataForm {
  return { dictLabel: '', dictValue: '', dictSort: '0', listClass: '', isDefault: '0', status: '0', remark: '' };
}

/**
 * 字典管理：左侧字典类型，右侧对应字典数据。
 */
export function DictPage() {
  const [types, setTypes] = useState<SysDictType[]>([]);
  const [typeTotal, setTypeTotal] = useState(0);
  const [typePage, setTypePage] = useState(1);
  const [typeKeyword, setTypeKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [typesLoading, setTypesLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<SysDictType | null>(null);

  const [dataRows, setDataRows] = useState<SysDictData[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<SysDictType | null>(null);
  const [typeForm, setTypeForm] = useState<TypeForm>(emptyTypeForm);
  const [typeSaving, setTypeSaving] = useState(false);

  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<SysDictData | null>(null);
  const [dataForm, setDataForm] = useState<DataForm>(emptyDataForm);
  const [dataSaving, setDataSaving] = useState(false);

  const loadTypes = useCallback(async () => {
    setTypesLoading(true);
    try {
      const result = await api.dict.typePage(typePage, TYPE_PAGE_SIZE, submittedKeyword);
      setTypes(result.rows);
      setTypeTotal(result.total);
    } catch {
      // 错误提示由请求层统一弹出
    } finally {
      setTypesLoading(false);
    }
  }, [typePage, submittedKeyword]);

  useEffect(() => {
    void loadTypes();
  }, [loadTypes]);

  useEffect(() => {
    if (types.length === 0) {
      setSelectedType(null);
      return;
    }
    setSelectedType((prev) => types.find((item) => item.dictId === prev?.dictId) ?? types[0]);
  }, [types]);

  useEffect(() => {
    if (!selectedType) {
      setDataRows([]);
      return;
    }
    let active = true;
    setDataLoading(true);
    api.dict
      .data(selectedType.dictType)
      .then((list) => {
        if (active) {
          setDataRows(list);
        }
      })
      .catch(() => {
        // 错误提示由请求层统一弹出
      })
      .finally(() => {
        if (active) {
          setDataLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [selectedType]);

  const handleTypeSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTypePage(1);
    setSubmittedKeyword(typeKeyword.trim());
  };

  const openCreateType = () => {
    setEditingType(null);
    setTypeForm(emptyTypeForm());
    setTypeModalOpen(true);
  };

  const openEditType = (type: SysDictType) => {
    setEditingType(type);
    setTypeForm({
      dictName: type.dictName,
      dictType: type.dictType,
      status: type.status,
      remark: type.remark ?? '',
    });
    setTypeModalOpen(true);
  };

  const closeTypeModal = () => {
    setTypeModalOpen(false);
    setEditingType(null);
  };

  const handleSaveType = async () => {
    if (!typeForm.dictName.trim() || !typeForm.dictType.trim()) {
      showToast('字典名称与字典类型不能为空', 'error');
      return;
    }
    const payload: DictTypePayload = {
      dictName: typeForm.dictName.trim(),
      dictType: typeForm.dictType.trim(),
      status: typeForm.status,
      remark: typeForm.remark || undefined,
    };
    setTypeSaving(true);
    try {
      if (editingType) {
        await api.dict.updateType(editingType.dictId, payload);
        showToast('字典类型已更新');
      } else {
        await api.dict.createType(payload);
        showToast('字典类型已创建');
      }
      closeTypeModal();
      await loadTypes();
    } catch {
      // 错误提示由请求层统一弹出
    } finally {
      setTypeSaving(false);
    }
  };

  const handleDeleteType = async (type: SysDictType) => {
    if (!window.confirm(`确认删除字典类型「${type.dictName}」吗？其字典数据会一并删除。`)) {
      return;
    }
    try {
      await api.dict.removeType(type.dictId);
      showToast('字典类型已删除');
      if (types.length === 1 && typePage > 1) {
        setTypePage(typePage - 1);
      } else {
        await loadTypes();
      }
    } catch {
      // 错误提示由请求层统一弹出
    }
  };

  const openCreateData = () => {
    if (!selectedType) {
      showToast('请先选择字典类型', 'error');
      return;
    }
    setEditingData(null);
    setDataForm(emptyDataForm());
    setDataModalOpen(true);
  };

  const openEditData = (data: SysDictData) => {
    setEditingData(data);
    setDataForm({
      dictLabel: data.dictLabel,
      dictValue: data.dictValue,
      dictSort: String(data.dictSort ?? 0),
      listClass: data.listClass ?? '',
      isDefault: data.isDefault,
      status: data.status,
      remark: data.remark ?? '',
    });
    setDataModalOpen(true);
  };

  const closeDataModal = () => {
    setDataModalOpen(false);
    setEditingData(null);
  };

  const handleSaveData = async () => {
    if (!selectedType) {
      return;
    }
    if (!dataForm.dictLabel.trim() || !dataForm.dictValue.trim()) {
      showToast('字典标签与字典键值不能为空', 'error');
      return;
    }
    const payload: DictDataPayload = {
      dictType: selectedType.dictType,
      dictLabel: dataForm.dictLabel.trim(),
      dictValue: dataForm.dictValue.trim(),
      dictSort: Number(dataForm.dictSort) || 0,
      listClass: dataForm.listClass || undefined,
      isDefault: dataForm.isDefault,
      status: dataForm.status,
      remark: dataForm.remark || undefined,
    };
    setDataSaving(true);
    try {
      if (editingData) {
        await api.dict.updateData(editingData.dictCode, payload);
        showToast('字典数据已更新');
      } else {
        await api.dict.createData(payload);
        showToast('字典数据已创建');
      }
      closeDataModal();
      setDataRows(await api.dict.data(selectedType.dictType));
    } catch {
      // 错误提示由请求层统一弹出
    } finally {
      setDataSaving(false);
    }
  };

  const handleDeleteData = async (data: SysDictData) => {
    if (!window.confirm(`确认删除字典数据「${data.dictLabel}」吗？`)) {
      return;
    }
    try {
      await api.dict.removeData(data.dictCode);
      showToast('字典数据已删除');
      if (selectedType) {
        setDataRows(await api.dict.data(selectedType.dictType));
      }
    } catch {
      // 错误提示由请求层统一弹出
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>字典管理</h1>
          <p>统一维护下拉选项等枚举数据，业务代码按字典类型读取。</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreateType}>
          新增字典类型
        </button>
      </div>

      <div className="split">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>字典类型</h2>
              <p>{typesLoading ? '加载中…' : `共 ${typeTotal} 个类型`}</p>
            </div>
          </div>
          <form className="toolbar toolbar-padded" onSubmit={handleTypeSearch}>
            <input
              className="input toolbar-input"
              value={typeKeyword}
              onChange={(event) => setTypeKeyword(event.target.value)}
              placeholder="搜索字典名称或类型"
            />
            <button type="submit" className="btn btn-ghost btn-sm">
              搜索
            </button>
          </form>
          <div className="table-wrap">
            <table className="table table-clickable">
              <thead>
                <tr>
                  <th>字典名称</th>
                  <th>字典类型</th>
                  <th>状态</th>
                  <th className="table-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                {types.map((type) => (
                  <tr
                    key={type.dictId}
                    className={selectedType?.dictId === type.dictId ? 'row-active' : undefined}
                    onClick={() => setSelectedType(type)}
                  >
                    <td>{type.dictName}</td>
                    <td className="mono">{type.dictType}</td>
                    <td>
                      <span className={type.status === '0' ? 'badge badge-success' : 'badge badge-danger'}>
                        {type.status === '0' ? '正常' : '停用'}
                      </span>
                    </td>
                    <td className="table-actions">
                      <button
                        type="button"
                        className="link-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditType(type);
                        }}
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        className="link-btn link-danger"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDeleteType(type);
                        }}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
                {!typesLoading && types.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty">
                      暂无字典类型
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <Pagination page={typePage} pageSize={TYPE_PAGE_SIZE} total={typeTotal} onChange={setTypePage} />
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>字典数据</h2>
              <p>{selectedType ? `当前类型：${selectedType.dictType}` : '请选择左侧字典类型'}</p>
            </div>
            <button type="button" className="btn btn-primary btn-sm" onClick={openCreateData} disabled={!selectedType}>
              新增数据
            </button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>标签</th>
                  <th>键值</th>
                  <th>排序</th>
                  <th>默认</th>
                  <th>状态</th>
                  <th>创建时间</th>
                  <th className="table-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                {dataRows.map((data) => (
                  <tr key={data.dictCode}>
                    <td>{data.dictLabel}</td>
                    <td className="mono">{data.dictValue}</td>
                    <td>{data.dictSort}</td>
                    <td>
                      <span className={data.isDefault === '1' ? 'badge badge-info' : 'badge badge-muted'}>
                        {data.isDefault === '1' ? '是' : '否'}
                      </span>
                    </td>
                    <td>
                      <span className={data.status === '0' ? 'badge badge-success' : 'badge badge-danger'}>
                        {data.status === '0' ? '正常' : '停用'}
                      </span>
                    </td>
                    <td className="text-muted">{formatTime(data.createTime)}</td>
                    <td className="table-actions">
                      <button type="button" className="link-btn" onClick={() => openEditData(data)}>
                        编辑
                      </button>
                      <button type="button" className="link-btn link-danger" onClick={() => void handleDeleteData(data)}>
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
                {!dataLoading && dataRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty">
                      {selectedType ? '该字典暂无数据' : '请选择字典类型'}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Modal
        open={typeModalOpen}
        title={editingType ? '编辑字典类型' : '新增字典类型'}
        onClose={closeTypeModal}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={closeTypeModal}>
              取消
            </button>
            <button type="button" className="btn btn-primary" onClick={() => void handleSaveType()} disabled={typeSaving}>
              {typeSaving ? '保存中…' : '保存'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <Field label="字典名称" required>
            <input
              className="input"
              value={typeForm.dictName}
              onChange={(event) => setTypeForm({ ...typeForm, dictName: event.target.value })}
              placeholder="例如 订单状态"
            />
          </Field>
          <Field label="字典类型" required>
            <input
              className="input"
              value={typeForm.dictType}
              onChange={(event) => setTypeForm({ ...typeForm, dictType: event.target.value })}
              placeholder="例如 order_status"
            />
          </Field>
          <Field label="状态">
            <select
              className="select"
              value={typeForm.status}
              onChange={(event) => setTypeForm({ ...typeForm, status: event.target.value })}
            >
              <option value="0">正常</option>
              <option value="1">停用</option>
            </select>
          </Field>
          <Field label="备注" wide>
            <textarea
              className="textarea"
              rows={3}
              value={typeForm.remark}
              onChange={(event) => setTypeForm({ ...typeForm, remark: event.target.value })}
              placeholder="可选"
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={dataModalOpen}
        title={editingData ? '编辑字典数据' : '新增字典数据'}
        onClose={closeDataModal}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={closeDataModal}>
              取消
            </button>
            <button type="button" className="btn btn-primary" onClick={() => void handleSaveData()} disabled={dataSaving}>
              {dataSaving ? '保存中…' : '保存'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <Field label="字典类型">
            <input className="input" value={selectedType?.dictType ?? ''} readOnly />
          </Field>
          <Field label="字典标签" required>
            <input
              className="input"
              value={dataForm.dictLabel}
              onChange={(event) => setDataForm({ ...dataForm, dictLabel: event.target.value })}
              placeholder="例如 待支付"
            />
          </Field>
          <Field label="字典键值" required>
            <input
              className="input"
              value={dataForm.dictValue}
              onChange={(event) => setDataForm({ ...dataForm, dictValue: event.target.value })}
              placeholder="例如 CREATED"
            />
          </Field>
          <Field label="显示排序">
            <input
              className="input"
              type="number"
              value={dataForm.dictSort}
              onChange={(event) => setDataForm({ ...dataForm, dictSort: event.target.value })}
            />
          </Field>
          <Field label="样式类名">
            <input
              className="input"
              value={dataForm.listClass}
              onChange={(event) => setDataForm({ ...dataForm, listClass: event.target.value })}
              placeholder="可选"
            />
          </Field>
          <Field label="是否默认">
            <select
              className="select"
              value={dataForm.isDefault}
              onChange={(event) => setDataForm({ ...dataForm, isDefault: event.target.value })}
            >
              <option value="0">否</option>
              <option value="1">是</option>
            </select>
          </Field>
          <Field label="状态">
            <select
              className="select"
              value={dataForm.status}
              onChange={(event) => setDataForm({ ...dataForm, status: event.target.value })}
            >
              <option value="0">正常</option>
              <option value="1">停用</option>
            </select>
          </Field>
          <Field label="备注" wide>
            <textarea
              className="textarea"
              rows={3}
              value={dataForm.remark}
              onChange={(event) => setDataForm({ ...dataForm, remark: event.target.value })}
              placeholder="可选"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
