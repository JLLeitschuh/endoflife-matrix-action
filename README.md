<p align="center">
  <a href="https://github.com/JLLeitschuh/endoflife-date-matrix-action/actions"><img alt="typescript-action status" src="https://github.com/JLLeitschuh/endoflife-date-matrix-action/workflows/Build-Test/badge.svg"></a>
</p>

# End of Life Date Matrix Action

This action uses the API from https://endoflife.date/ to generate a matrix of supported versions for a given product.

This can be used to generate a matrix of supported versions for a given product to be used in a GitHub Actions workflow.

## Usage

```yaml
name: Test against all supported versions of Java

on: [push]

jobs:
  create-jvm-matrix:
    runs-on: ubuntu-latest
    steps:
      - name: Get supported versions of Java
        id: create-matrix
        uses: JLLeitschuh/endoflife-date-matrix-action@v1
        with:
          product: java
    outputs:
      jvm_version_matrix: ${{ steps.create-matrix.outputs.versions }}
  build:
    runs-on: ubuntu-latest
    needs: create-jvm-matrix
    strategy:
      matrix:
        java-version: ${{ fromJson(needs.create-jvm-matrix.outputs.jvm_version_matrix) }}
    steps:
      - uses: actions/checkout@v2
      - name: Set up JDK ${{ matrix.java-version }}
        uses: actions/setup-java@v3
        with:
          java-version: ${{ matrix.java-version }}
      - name: Build with Maven
        run: mvn -B package --file pom.xml
```
