var alasql = require('alasql');

var data = [
    {
        "supplierName": "供应商名称：浙江精工科技有限公司",
        "qcPlan": "质量检验方案：原材料入库检验方案A",
        "creator": "制单人：张三",
        "itemCode": "存货编码：MAT-202411-001",
        "itemName": "存货名称：不锈钢螺栓",
        "specModel": "规格型号：M8x20",
        "supplierBatchNo": "供应商批号：SUP202411A01",
        "batchNo": "批号：BATCH2024110501",
        "inspectQty": "报检数量：2000",
        "docStatus": "单据状态：已审核",
        "inspectNo": "检验单号：QC20241113001",
        "inspectDate": "检验日期：2025-11-13",
        "inspectTime": "检验时间：14:30:00",
        "reportNo": "报检单号：RJ20241112005",
        "inspectDept": "检验部门名称：质量管理部",
        "arrivalNo": "到货单号：DA20241112003",
        "purchaseDept": "采购/委外部门名称：采购一部",
        "reporter": "报检人：李四",
        "shelfLife": "保质期：12个月",
        "prodDate": "生产日期：2025-10-25",
        "unit": "主计量单位：PCS",
        "inspectMethod": "检验方式：全检",
        "defectQty": "样本不合格数：3",
        "inspector": "检验员：王五",
        "auditor": "审核人：赵六",
        "qcStdCode": "检验标准编码：QCS-001-A",
        "qcStdName": "检验标准名称：螺栓尺寸精度标准A",
        "reportPcs": "报检件数：10",
        "data": [
          {
            "inspectionItemName": "【性状】",
            "inspectionIndicatorName": "本品为白色或类白色粉末",
            "inspectionUnit": "KG",
            "inspectionDate": "2025-01-21 00:00:00",
            "inspectionTime": "15:25:27",
            "inspectionQuantity": "0.003",
            "standardValue": "本品为白色或类白色粉末",
            "upperLimit": "",
            "lowerLimit": "",
            "measuredValue": "本品为类白色粉末",
            "qualifiedQuantity": "0.003",
            "inspectorName": ""
          },
          {
            "inspectionItemName": "【鉴别】",
            "inspectionIndicatorName": "（2）应呈正反应",
            "inspectionUnit": "KG",
            "inspectionDate": "2025-01-21 00:00:00",
            "inspectionTime": "15:25:27",
            "inspectionQuantity": "0.003",
            "standardValue": "（2）应呈正反应",
            "upperLimit": "",
            "lowerLimit": "",
            "measuredValue": "呈正反应",
            "qualifiedQuantity": "0.003",
            "inspectorName": ""
          }
        ]
    }
]

  
// 使用SEARCH方法查询所需数据
var res = alasql('SEARCH / AS @record \
    data / AS @inspection \
    RETURN(@record->supplierName AS supplierName, @inspection->inspectionItemName AS inspectionItemName, @inspection->measuredValue AS measuredValue) \
    FROM ?',[data]);

console.log(res);


// [
//     {
//       supplierName: '供应商名称：浙江精工科技有限公司',
//       inspectionItemName: '【性状】',
//       measuredValue: '本品为类白色粉末'
//     },
//     {
//       supplierName: '供应商名称：浙江精工科技有限公司',
//       inspectionItemName: '【鉴别】',
//       measuredValue: '呈正反应'
//     }
// ]
