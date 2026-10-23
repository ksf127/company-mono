package com.company.mono;

import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.Architectures.layeredArchitecture;

/**
 * 分层约束：controller -> service -> mapper。
 * 新增业务模块时无需改测试，只要遵守包结构即可自动被约束。
 */
@AnalyzeClasses(packages = "com.company.mono", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

    @ArchTest
    static final ArchRule controller_不能直接依赖_mapper = noClasses()
            .that().resideInAPackage("..controller..")
            .should().dependOnClassesThat().resideInAPackage("..mapper..")
            .because("controller 只能调用 service，持久化细节必须留在 service 层");

    @ArchTest
    static final ArchRule 分层依赖方向正确 = layeredArchitecture()
            // 只校验三层之间的依赖，实体、DTO、公共组件不在此规则范围内
            .consideringOnlyDependenciesInLayers()
            .layer("Controller").definedBy("..controller..")
            .layer("Service").definedBy("..service..")
            .layer("Mapper").definedBy("..mapper..")
            .whereLayer("Controller").mayNotBeAccessedByAnyLayer()
            .whereLayer("Service").mayOnlyBeAccessedByLayers("Controller")
            .whereLayer("Mapper").mayOnlyBeAccessedByLayers("Service")
            .because("依赖方向只能是 controller -> service -> mapper");
}
